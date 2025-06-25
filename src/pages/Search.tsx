import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PurposeTable } from '@/components/tables/PurposeTable';
import { PurposeModal } from '@/components/modals/PurposeModal';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { SortControls } from '@/components/search/SortControls';
import { ResultsSummary } from '@/components/search/ResultsSummary';
import { Purpose, PurposeFilters } from '@/types';
import { SortConfig } from '@/utils/sorting';
import { usePurposeData } from '@/hooks/usePurposeData';
import { usePurposeMutations } from '@/hooks/usePurposeMutations';
import { exportPurposesToCSV } from '@/utils/csvExport';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper function to calculate default "Last Year" date range
  const getDefaultDateRange = () => {
    const today = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);
    
    return {
      start_date: lastYear.toISOString().split('T')[0], // Format as YYYY-MM-DD
      end_date: today.toISOString().split('T')[0]
    };
  };

  // Parse URL params to initial state
  const getInitialFilters = (): PurposeFilters => {
    const filters: PurposeFilters = {};
    
    if (searchParams.get('search_query')) {
      filters.search_query = searchParams.get('search_query') || undefined;
    }
    if (searchParams.get('service_type')) {
      filters.service_type = searchParams.get('service_type')?.split(',') as any;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')?.split(',') as any;
    }
    if (searchParams.get('supplier')) {
      filters.supplier = searchParams.get('supplier')?.split(',') as any;
    }
    if (searchParams.get('hierarchy_id')) {
      const hierarchyIds = searchParams.get('hierarchy_id')?.split(',');
      filters.hierarchy_id = hierarchyIds && hierarchyIds.length > 1 ? hierarchyIds : hierarchyIds?.[0];
    }
    if (searchParams.get('material')) {
      filters.material = searchParams.get('material')?.split(',') as any;
    }
    if (searchParams.get('start_date')) {
      filters.start_date = searchParams.get('start_date') || undefined;
    }
    if (searchParams.get('end_date')) {
      filters.end_date = searchParams.get('end_date') || undefined;
    }
    if (searchParams.get('relative_time')) {
      filters.relative_time = searchParams.get('relative_time') || undefined;
    }

    // If no date/time filters are provided in URL, set default "Last Year" values
    const hasDateTimeParams = searchParams.get('start_date') || searchParams.get('end_date') || searchParams.get('relative_time');
    if (!hasDateTimeParams) {
      const defaultRange = getDefaultDateRange();
      filters.start_date = defaultRange.start_date;
      filters.end_date = defaultRange.end_date;
      filters.relative_time = 'last_year';
    }

    return filters;
  };

  const getInitialSortConfig = (): SortConfig => {
    const sortField = searchParams.get('sort_field') as any;
    const sortDirection = searchParams.get('sort_direction') as any;
    
    return {
      field: sortField || 'creation_time',
      direction: sortDirection || 'desc'
    };
  };

  const getInitialPage = (): number => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  };

  const {
    purposes,
    filteredPurposes,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    setModalMode,
    selectedPurpose,
    setSelectedPurpose,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    isLoading,
    error
  } = usePurposeData(getInitialFilters(), getInitialSortConfig(), getInitialPage());

  // Get mutation functions
  const { createPurpose, updatePurpose, deletePurpose } = usePurposeMutations();

  // Update URL when filters, sorting, or pagination changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add search query
    if (filters.search_query) {
      params.set('search_query', filters.search_query);
    }

    // Add service types
    if (filters.service_type && filters.service_type.length > 0) {
      params.set('service_type', filters.service_type.join(','));
    }

    // Add statuses
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    }

    // Add suppliers
    if (filters.supplier && filters.supplier.length > 0) {
      params.set('supplier', filters.supplier.join(','));
    }

    // Add hierarchy IDs
    if (filters.hierarchy_id) {
      const hierarchyIds = Array.isArray(filters.hierarchy_id) ? filters.hierarchy_id : [filters.hierarchy_id];
      params.set('hierarchy_id', hierarchyIds.join(','));
    }

    // Add materials
    if (filters.material && filters.material.length > 0) {
      params.set('material', filters.material.join(','));
    }

    // Add date/time filters (always include these if they have values, including defaults)
    if (filters.start_date) {
      params.set('start_date', filters.start_date);
    }
    if (filters.end_date) {
      params.set('end_date', filters.end_date);
    }
    if (filters.relative_time) {
      params.set('relative_time', filters.relative_time);
    }

    // Add sorting
    if (sortConfig.field !== 'creation_time' || sortConfig.direction !== 'desc') {
      params.set('sort_field', sortConfig.field);
      params.set('sort_direction', sortConfig.direction);
    }

    // Add pagination
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    setSearchParams(params, { replace: true });
  }, [filters, sortConfig, currentPage, setSearchParams]);

  const itemsPerPage = 10;

  // Calculate display indices for server-side pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + filteredPurposes.length, totalCount);

  const handleViewPurpose = (purpose: Purpose) => {
    setSelectedPurpose(purpose);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditPurpose = (purpose: Purpose) => {
    setSelectedPurpose(purpose);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeletePurpose = (purposeId: string) => {
    deletePurpose.mutate(purposeId);
  };

  const handleSavePurpose = (purposeData: Partial<Purpose>) => {
    if (modalMode === 'create') {
      try {
        createPurpose.mutate(purposeData);
      } catch (error) {
        // Error handling will be done by the mutation
      }
    } else if (modalMode === 'edit' && selectedPurpose) {
      updatePurpose.mutate({ 
        id: selectedPurpose.id, 
        data: purposeData 
      });
    }

    setIsModalOpen(false);
  };

  const handleExport = () => {
    const { toast } = require('@/hooks/use-toast');
    exportPurposesToCSV(filteredPurposes, toast);
  };

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load purposes</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Search Purposes</h1>
      </div>

              <SearchFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
      />

      <SortControls
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
      />

      <ResultsSummary
        startIndex={startIndex}
        endIndex={endIndex}
        filteredCount={totalCount}
        filters={filters}
        sortConfig={sortConfig}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <PurposeTable
        purposes={filteredPurposes}
        onView={handleViewPurpose}
        onEdit={handleEditPurpose}
        onDelete={handleDeletePurpose}
        isLoading={isLoading}
      />

      <PurposeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        purpose={selectedPurpose}
        onSave={handleSavePurpose}
        onEdit={handleEditPurpose}
        onDelete={handleDeletePurpose}
      />
    </div>
  );
};

export default Search;
