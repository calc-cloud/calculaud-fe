import {UnifiedFilters} from '@/types/filters';

import {SortField, SortDirection} from './sorting';

/**
 * Count active filters for display purposes
 */
export const countActiveFilters = (filters: UnifiedFilters): number => {
  return [
    // Count relative time only if it's not the default
    ...(filters.relative_time && filters.relative_time !== 'all_time' ? [1] : []),
    // Count each individual hierarchy selection
    ...(filters.hierarchy_id || []),
    // Count each individual service type selection
    ...(filters.service_type || []),
    // Count each individual status selection
    ...(filters.status || []),
    // Count each individual supplier selection
    ...(filters.supplier || []),
    // Count each individual material selection
    ...(filters.material || []),
    // Count each individual pending authority selection
    ...(filters.pending_authority || []),
  ].length;
};

/**
 * Calculate pagination display indices for server-side pagination
 */
export const calculatePaginationIndices = (
  currentPage: number,
  itemsPerPage: number,
  actualItemsCount: number,
  totalCount: number
) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + actualItemsCount, totalCount);
  
  return { startIndex, endIndex };
};

/**
 * Constants for search page
 */
export const SEARCH_CONSTANTS = {
  ITEMS_PER_PAGE: 10,
  DEFAULT_SORT_FIELD: 'creation_time' as SortField,
  DEFAULT_SORT_DIRECTION: 'desc' as SortDirection
} as const;