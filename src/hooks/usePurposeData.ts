import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Purpose, PurposeFilters, ModalMode } from '@/types';
import { SortConfig } from '@/utils/sorting';
import { purposeService } from '@/services/purposeService';
import { useAdminData } from '@/contexts/AdminDataContext';

export const usePurposeData = (
  initialFilters: PurposeFilters = {},
  initialSortConfig: SortConfig = { field: 'creation_time', direction: 'desc' },
  initialPage: number = 1
) => {
  const { hierarchies, suppliers, serviceTypes } = useAdminData();
  const [filters, setFilters] = useState<PurposeFilters>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | undefined>();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 10;

  // Build API query parameters - simplified since we can handle multiple filters in one request
  const apiParams = useMemo(() => {
    return purposeService.mapFiltersToApiParams(
      filters,
      sortConfig,
      currentPage,
      itemsPerPage,
      hierarchies,
      suppliers,
      serviceTypes
    );
  }, [filters, sortConfig, currentPage, hierarchies, suppliers, serviceTypes]);

  // Fetch purposes from API with disabled caching
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['purposes', apiParams],
    queryFn: () => {
      return purposeService.getPurposes(apiParams);
    },
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data (renamed from cacheTime)
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
    const inProgress = purposes.filter(p => p.status === 'IN_PROGRESS').length;
    const completed = purposes.filter(p => p.status === 'COMPLETED').length;
    const totalCost = purposes.reduce((sum, purpose) => {
      const purposeCost = purpose.emfs.reduce((emfSum, emf) => 
        emfSum + emf.costs.reduce((costSum, cost) => costSum + cost.amount, 0), 0
      );
      return sum + purposeCost;
    }, 0);

    return { total, inProgress, completed, totalCost };
  }, [purposes, totalCount]);

  // Reset to first page when filters or sorting change
  const handleFiltersChange = (newFilters: PurposeFilters) => {
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
