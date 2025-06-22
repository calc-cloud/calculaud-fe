
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PurposeTable } from '@/components/tables/PurposeTable';
import { PurposeModal } from '@/components/modals/PurposeModal';
import { FilterBar } from '@/components/common/FilterBar';
import { SortControls } from '@/components/search/SortControls';
import { ResultsSummary } from '@/components/search/ResultsSummary';
import { TablePagination } from '@/components/tables/TablePagination';
import { Purpose, PurposeFilters } from '@/types';
import { SortConfig } from '@/utils/sorting';
import { usePurposeData } from '@/hooks/usePurposeData';
import { usePurposeMutations } from '@/hooks/usePurposeMutations';
import { exportPurposesToCSV } from '@/utils/csvExport';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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
    console.log('=== Search.handleDeletePurpose ===', purposeId);
    deletePurpose.mutate(purposeId);
  };

  const handleSavePurpose = (purposeData: Partial<Purpose>) => {
    console.log('=== Search.handleSavePurpose START ===');
    console.log('Modal mode:', modalMode);
    console.log('Purpose data received:', purposeData);
    console.log('createPurpose mutation:', !!createPurpose, typeof createPurpose.mutate);
    console.log('updatePurpose mutation:', !!updatePurpose, typeof updatePurpose.mutate);

    if (modalMode === 'create') {
      console.log('Creating new purpose...');
      console.log('About to call createPurpose.mutate with:', purposeData);
      
      try {
        createPurpose.mutate(purposeData);
        console.log('createPurpose.mutate called successfully');
      } catch (error) {
        console.error('Error calling createPurpose.mutate:', error);
      }
    } else if (modalMode === 'edit' && selectedPurpose) {
      console.log('Updating existing purpose...');
      updatePurpose.mutate({ 
        id: selectedPurpose.id, 
        data: purposeData 
      });
    } else {
      console.error('Invalid state for saving purpose:', { modalMode, hasSelectedPurpose: !!selectedPurpose });
    }

    console.log('Closing modal...');
    setIsModalOpen(false);
    console.log('=== Search.handleSavePurpose END ===');
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

      <FilterBar
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
      />

      <PurposeTable
        purposes={filteredPurposes}
        onView={handleViewPurpose}
        onEdit={handleEditPurpose}
        onDelete={handleDeletePurpose}
        isLoading={isLoading}
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
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
