
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Purpose, PurposeFilters, ModalMode } from '@/types';
import { SortConfig } from '@/utils/sorting';
import { purposeService } from '@/services/purposeService';
import { useAdminData } from '@/contexts/AdminDataContext';

export const usePurposeData = () => {
  const { hierarchies, suppliers, serviceTypes } = useAdminData();
  const [filters, setFilters] = useState<PurposeFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'creation_time', direction: 'desc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Build multiple API queries for multiple filter combinations when needed
  const apiQueries = useMemo(() => {
    console.log('Building API queries with filters:', filters);
    
    // If we have multiple service types, suppliers, or hierarchies, we need to make separate requests
    const serviceTypes = filters.service_type || [];
    const suppliers = filters.supplier || [];
    const hierarchyIds = Array.isArray(filters.hierarchy_id) ? filters.hierarchy_id : (filters.hierarchy_id ? [filters.hierarchy_id] : []);
    
    // For now, let's handle one filter type at a time properly
    // If multiple service types are selected, make separate requests for each
    if (serviceTypes.length > 1) {
      return serviceTypes.map(serviceType => {
        const singleTypeFilters = { ...filters, service_type: [serviceType] };
        return purposeService.mapFiltersToApiParams(
          singleTypeFilters,
          sortConfig,
          currentPage,
          itemsPerPage,
          hierarchies,
          suppliers,
          serviceTypes
        );
      });
    }
    
    // If multiple suppliers are selected, make separate requests for each
    if (suppliers.length > 1) {
      return suppliers.map(supplier => {
        const singleSupplierFilters = { ...filters, supplier: [supplier] };
        return purposeService.mapFiltersToApiParams(
          singleSupplierFilters,
          sortConfig,
          currentPage,
          itemsPerPage,
          hierarchies,
          suppliers,
          serviceTypes
        );
      });
    }
    
    // If multiple hierarchies are selected, make separate requests for each
    if (hierarchyIds.length > 1) {
      return hierarchyIds.map(hierarchyId => {
        const singleHierarchyFilters = { ...filters, hierarchy_id: hierarchyId };
        return purposeService.mapFiltersToApiParams(
          singleHierarchyFilters,
          sortConfig,
          currentPage,
          itemsPerPage,
          hierarchies,
          suppliers,
          serviceTypes
        );
      });
    }
    
    // Default single request
    return [purposeService.mapFiltersToApiParams(
      filters,
      sortConfig,
      currentPage,
      itemsPerPage,
      hierarchies,
      suppliers,
      serviceTypes
    )];
  }, [filters, sortConfig, currentPage, hierarchies, suppliers, serviceTypes]);

  // Use the first query params for the main query (we'll improve this later)
  const mainApiParams = apiQueries[0];

  // Fetch purposes from API with disabled caching
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['purposes', mainApiParams],
    queryFn: () => {
      console.log('Fetching purposes with main params:', mainApiParams);
      return purposeService.getPurposes(mainApiParams);
    },
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Transform API response to match frontend structure
  const { purposes, filteredPurposes, totalPages, totalCount } = useMemo(() => {
    if (!apiResponse) {
      return {
        purposes: [],
        filteredPurposes: [],
        totalPages: 0,
        totalCount: 0
      };
    }

    const transformed = purposeService.transformApiResponse(apiResponse, hierarchies);
    
    return {
      purposes: transformed.purposes,
      filteredPurposes: transformed.purposes, // No client-side filtering needed
      totalPages: transformed.pages,
      totalCount: transformed.total
    };
  }, [apiResponse, hierarchies]);

  // Calculate dashboard statistics from current purposes
  const stats = useMemo(() => {
    const total = totalCount;
    const pending = purposes.filter(p => p.status === 'PENDING').length;
    const inProgress = purposes.filter(p => p.status === 'IN_PROGRESS').length;
    const completed = purposes.filter(p => p.status === 'COMPLETED').length;
    const totalCost = purposes.reduce((sum, purpose) => {
      const purposeCost = purpose.emfs.reduce((emfSum, emf) => 
        emfSum + emf.costs.reduce((costSum, cost) => costSum + cost.amount, 0), 0
      );
      return sum + purposeCost;
    }, 0);

    return { total, pending, inProgress, completed, totalCost };
  }, [purposes, totalCount]);

  // Reset to first page when filters or sorting change
  const handleFiltersChange = (newFilters: PurposeFilters) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  };

  const handleSortChange = (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setCurrentPage(1); // Reset to first page
  };

  return {
    purposes,
    filteredPurposes,
    filters,
    setFilters: handleFiltersChange,
    sortConfig,
    setSortConfig: handleSortChange,
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
    stats,
    isLoading,
    error,
    refetch
  };
};
