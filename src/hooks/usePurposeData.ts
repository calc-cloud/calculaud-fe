import {useMemo, useRef, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Purpose} from '@/types';
import {UnifiedFilters} from '@/types/filters';
import {SortConfig} from '@/utils/sorting';
import {purposeService} from '@/services/purposeService';
import {useAdminData} from '@/contexts/AdminDataContext';

export const usePurposeData = (
  initialFilters: UnifiedFilters = {},
  initialSortConfig: SortConfig = { field: 'creation_time', direction: 'desc' },
  initialPage: number = 1
) => {
  const { hierarchies, suppliers, serviceTypes, materials } = useAdminData();
  const [filters, setFilters] = useState<UnifiedFilters>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 10;

  // Store previous pagination values to prevent jumping during loading
  const previousPaginationRef = useRef({totalPages: 0, totalCount: 0});

  // Build API query parameters - simplified since we can handle multiple filters in one request
  const apiParams = useMemo(() => {
    return purposeService.mapFiltersToApiParams(
      filters,
      sortConfig,
      currentPage,
      itemsPerPage
    );
  }, [filters, sortConfig, currentPage]);

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
      // During loading, preserve previous pagination values to prevent UI jumping
      return {
        purposes: [],
        filteredPurposes: [],
        totalPages: isLoading ? previousPaginationRef.current.totalPages : 0,
        totalCount: isLoading ? previousPaginationRef.current.totalCount : 0
      };
    }

    try {
      const transformed = purposeService.transformApiResponse(apiResponse, hierarchies);
      
      // Update the previous pagination values when we have fresh data
      previousPaginationRef.current = {
        totalPages: transformed.pages,
        totalCount: transformed.total
      };
      
      return {
        purposes: transformed.purposes,
        filteredPurposes: transformed.purposes, // No client-side filtering needed
        totalPages: transformed.pages,
        totalCount: transformed.total
      };
    } catch (transformError) {
      return {
        purposes: [],
        filteredPurposes: [],
        totalPages: 0,
        totalCount: 0
      };
    }
  }, [apiResponse, hierarchies, isLoading]);

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
  const handleFiltersChange = (newFilters: UnifiedFilters) => {
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
