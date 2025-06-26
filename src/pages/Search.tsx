import React, {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import {PurposeTable} from '@/components/tables/PurposeTable';
import {PurposeModal} from '@/components/modals/PurposeModal';
import {SearchFilterBar} from '@/components/common/SearchFilterBar';
import {SortControls} from '@/components/search/SortControls';
import {TablePagination} from '@/components/tables/TablePagination';
import {Badge} from '@/components/ui/badge';
import {X} from 'lucide-react';
import {useAdminData} from '@/contexts/AdminDataContext';
import {Purpose, PurposeFilters} from '@/types';
import {SortConfig} from '@/utils/sorting';
import {usePurposeData} from '@/hooks/usePurposeData';
import {usePurposeMutations} from '@/hooks/usePurposeMutations';
import {exportPurposesToCSV} from '@/utils/csvExport';

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
    
    // Parse service type IDs
    if (searchParams.get('service_type_id')) {
      const serviceTypeIds = searchParams.get('service_type_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (serviceTypeIds && serviceTypeIds.length > 0) {
        filters.service_type = serviceTypeIds as any;
      }
    }
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')?.split(',') as any;
    }
    
    // Parse supplier IDs
    if (searchParams.get('supplier_id')) {
      const supplierIds = searchParams.get('supplier_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (supplierIds && supplierIds.length > 0) {
        filters.supplier = supplierIds as any;
      }
    }
    
    if (searchParams.get('hierarchy_id')) {
      const hierarchyIds = searchParams.get('hierarchy_id')?.split(',');
      filters.hierarchy_id = hierarchyIds && hierarchyIds.length > 1 ? hierarchyIds : hierarchyIds?.[0];
    }
    
    // Parse material IDs (service IDs)
    if (searchParams.get('material_id')) {
      const materialIds = searchParams.get('material_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (materialIds && materialIds.length > 0) {
        filters.material = materialIds as any;
      }
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

  // Get admin data for filter badges
  const {hierarchies, suppliers, serviceTypes, materials} = useAdminData();

  // Update URL when filters, sorting, or pagination changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add search query
    if (filters.search_query) {
      params.set('search_query', filters.search_query);
    }

    // Add service type IDs
    if (filters.service_type && filters.service_type.length > 0) {
      params.set('service_type_id', filters.service_type.join(','));
    }

    // Add statuses
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    }

    // Add supplier IDs
    if (filters.supplier && filters.supplier.length > 0) {
      params.set('supplier_id', filters.supplier.join(','));
    }

    // Add hierarchy IDs
    if (filters.hierarchy_id) {
      const hierarchyIds = Array.isArray(filters.hierarchy_id) ? filters.hierarchy_id : [filters.hierarchy_id];
      params.set('hierarchy_id', hierarchyIds.join(','));
    }

    // Add material IDs
    if (filters.material && filters.material.length > 0) {
      params.set('material_id', filters.material.join(','));
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
        <h1 className="text-2xl font-bold text-gray-900">Search Purposes</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <SearchFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExport}
        />

        {/* Filter badges to prevent layout jumps */}
        <div className="min-h-[32px] flex flex-wrap gap-2">
          {filters.service_type && (filters.service_type as number[]).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(filters.service_type as number[]).map((typeId) => {
                  const type = serviceTypes.find(st => st.id === typeId);
                  return type ? (
                      <Badge key={typeId} variant="secondary" className="flex items-center gap-1">
                        Service: {type.name}
                        <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => {
                              const currentArray = filters.service_type || [];
                              const newArray = currentArray.filter(id => id !== typeId);
                              setFilters({...filters, service_type: newArray.length > 0 ? newArray : undefined});
                            }}
                        />
                      </Badge>
                  ) : null;
                })}
              </div>
          )}
          {filters.status && filters.status.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.status.map((status) => (
                    <Badge key={status} variant="secondary" className="flex items-center gap-1">
                      Status: {status}
                      <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            const currentArray = filters.status || [];
                            const newArray = currentArray.filter(s => s !== status);
                            setFilters({...filters, status: newArray.length > 0 ? newArray : undefined});
                          }}
                      />
                    </Badge>
                ))}
              </div>
          )}
          {filters.supplier && (filters.supplier as number[]).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(filters.supplier as number[]).map((supplierId) => {
                  const supplier = suppliers.find(s => s.id === supplierId);
                  return supplier ? (
                      <Badge key={supplierId} variant="secondary" className="flex items-center gap-1">
                        Supplier: {supplier.name}
                        <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => {
                              const currentArray = filters.supplier || [];
                              const newArray = currentArray.filter(id => id !== supplierId);
                              setFilters({...filters, supplier: newArray.length > 0 ? newArray : undefined});
                            }}
                        />
                      </Badge>
                  ) : null;
                })}
              </div>
          )}
          {filters.material && (filters.material as number[]).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(filters.material as number[]).map((materialId) => {
                  const material = materials.find(m => m.id === materialId);
                  return material ? (
                      <Badge key={materialId} variant="secondary" className="flex items-center gap-1">
                        Material: {material.name}
                        <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => {
                              const currentArray = filters.material || [];
                              const newArray = currentArray.filter(id => id !== materialId);
                              setFilters({...filters, material: newArray.length > 0 ? newArray : undefined});
                            }}
                        />
                      </Badge>
                  ) : null;
                })}
              </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SortControls
              sortConfig={sortConfig}
              onSortChange={setSortConfig}
          />
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of {totalCount} purposes
          </p>
        </div>

        <div className="flex-shrink-0">
          <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
          />
        </div>
      </div>

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
