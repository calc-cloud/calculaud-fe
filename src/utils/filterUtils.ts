// Shared filter utilities
import { format, subDays, subMonths, subYears, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { UnifiedFilters } from '@/types/filters';

export const calculateDateRange = (relativeTime: string) => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date = today;

  switch (relativeTime) {
    case 'last_7_days':
      startDate = subDays(today, 7);
      break;
    case 'last_30_days':
      startDate = subDays(today, 30);
      break;
    case 'last_3_months':
      startDate = subMonths(today, 3);
      break;
    case 'last_6_months':
      startDate = subMonths(today, 6);
      break;
    case 'last_year':
      startDate = subYears(today, 1);
      break;
    case 'this_week':
      startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
      break;
    case 'this_month':
      startDate = startOfMonth(today);
      break;
    case 'this_year':
      startDate = startOfYear(today);
      break;
    case 'all_time':
      // For "All Time", clear the date filters by returning undefined
      return undefined;
    default:
      return; // Don't update dates for custom or unknown values
  }

  return {
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd')
  };
};

export const handleRelativeTimeChange = (
  relativeTime: string,
  currentFilters: UnifiedFilters,
  onFiltersChange: (filters: UnifiedFilters) => void
) => {
  const dateRange = calculateDateRange(relativeTime);
  
  let newFilters = {
    ...currentFilters,
    relative_time: relativeTime
  };

  if (relativeTime === 'all_time') {
    // For "All Time", remove date constraints
    newFilters = {
      ...currentFilters,
      relative_time: relativeTime,
      start_date: undefined,
      end_date: undefined
    };
  } else if (dateRange) {
    // For other relative times, update with calculated dates
    newFilters = {
      ...currentFilters,
      relative_time: relativeTime,
      ...dateRange
    };
  }
  
  onFiltersChange(newFilters);
};

export const handleDateChange = (
  key: 'start_date' | 'end_date',
  value: string | undefined,
  currentFilters: UnifiedFilters,
  onFiltersChange: (filters: UnifiedFilters) => void
) => {
  const newFilters = {
    ...currentFilters,
    [key]: value,
    relative_time: 'custom' // Set to custom when manually changing dates
  };
  
  onFiltersChange(newFilters);
};

export const clearFilters = (onFiltersChange: (filters: UnifiedFilters) => void) => {
  // Reset to default state with "Last Year" relative time and corresponding date range
  const defaultDateRange = calculateDateRange('last_year');
  const defaultFilters = {
    relative_time: 'last_year',
    ...defaultDateRange
  };
  onFiltersChange(defaultFilters);
};

export const getActiveFiltersCount = (filters: UnifiedFilters, mode: 'search' | 'dashboard' = 'search') => {
  // Get default state for comparison
  const defaultDateRange = calculateDateRange('last_year');
  const isDefaultDateRange = filters.start_date === defaultDateRange?.start_date && 
                            filters.end_date === defaultDateRange?.end_date;
  const isDefaultRelativeTime = (filters.relative_time || 'last_year') === 'last_year';
  
  let count = 0;
  
  // Only count non-default filters
  if (filters.search_query?.trim()) count++;
  if (filters.service_type?.length) count++;
  if (filters.status?.length) count++;
  if (filters.supplier?.length) count++;
  if (filters.material?.length) count++;
  if (filters.hierarchy_id) {
    const hierarchyIds = Array.isArray(filters.hierarchy_id) ? filters.hierarchy_id : [filters.hierarchy_id];
    if (hierarchyIds.length > 0) count++;
  }
  
  // Only count date/time filters if they're not the default
  if (!isDefaultDateRange || !isDefaultRelativeTime) {
    if (filters.relative_time === 'custom') {
      count++; // Custom date range
    } else if (filters.relative_time && filters.relative_time !== 'last_year') {
      count++; // Non-default relative time
    }
  }
  
  return count;
};

// Helper functions for array manipulation
export const toggleArrayItem = <T>(array: T[] | undefined, item: T): T[] => {
  const currentArray = array || [];
  const index = currentArray.indexOf(item);
  
  if (index === -1) {
    return [...currentArray, item];
  } else {
    return currentArray.filter((_, i) => i !== index);
  }
};

// Label generation helpers
export const getFilterLabel = (
  items: any[] | undefined,
  defaultLabel: string,
  getName?: (item: any) => string
): string => {
  if (!items || items.length === 0) return defaultLabel;
  if (items.length === 1) {
    return getName ? getName(items[0]) : items[0];
  }
  return `${items.length} selected`;
}; 