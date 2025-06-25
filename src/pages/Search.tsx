import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PurposeTable } from '@/components/tables/PurposeTable';
import { PurposeModal } from '@/components/modals/PurposeModal';
import { UnifiedFilters } from '@/components/common/UnifiedFilters';
import { SortControls } from '@/components/search/SortControls';
import { ResultsSummary } from '@/components/search/ResultsSummary';
import { Purpose } from '@/types';
import { SearchFilters } from '@/types/commonFilters';
import { SortConfig } from '@/utils/sorting';
import { usePurposeData } from '@/hooks/usePurposeData';
import { usePurposeMutations } from '@/hooks/usePurposeMutations';
import { exportPurposesToCSV } from '@/utils/csvExport';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse URL params to initial state
  const getInitialFilters = (): SearchFilters => {
    const filters: SearchFilters = {};
    
    if (searchParams.get('search_query')) {
      filters.search_query = searchParams.get('search_query') || undefined;
    }
    if (searchParams.get('service_type_ids')) {
      filters.service_type_ids = searchParams.get('service_type_ids')?.split(',').map(id => parseInt(id));
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')?.split(',');
    }
    if (searchParams.get('supplier_ids')) {
      filters.supplier_ids = searchParams.get('supplier_ids')?.split(',').map(id => parseInt(id));
    }
    if (searchParams.get('hierarchy_ids')) {
      filters.hierarchy_ids = searchParams.get('hierarchy_ids')?.split(',').map(id => parseInt(id));
    }
    if (searchParams.get('service_ids')) {
      filters.service_ids = searchParams.get('service_ids')?.split(',').map(id => parseInt(id));
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

    // Add service type IDs
    if (filters.service_type_ids && filters.service_type_ids.length > 0) {
      params.set('service_type_ids', filters.service_type_ids.join(','));
    }

    // Add statuses
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    }

    // Add supplier IDs
    if (filters.supplier_ids && filters.supplier_ids.length > 0) {
      params.set('supplier_ids', filters.supplier_ids.join(','));
    }

    // Add hierarchy IDs
    if (filters.hierarchy_ids && filters.hierarchy_ids.length > 0) {
      params.set('hierarchy_ids', filters.hierarchy_ids.join(','));
    }

    // Add service IDs (materials)
    if (filters.service_ids && filters.service_ids.length > 0) {
      params.set('service_ids', filters.service_ids.join(','));
    }

    // Add date filters
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

      <UnifiedFilters
        filters={filters}
        onFiltersChange={setFilters}
        showSearch={true}
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
