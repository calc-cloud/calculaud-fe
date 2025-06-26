// Shared filter utilities
import { format, subDays, subMonths, subYears, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { UnifiedFilters } from '@/types/filters';

// Cache the default date range to avoid recalculating
const getDefaultDateRange = () => calculateDateRange('last_year');

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

export const clearFilters = (onFiltersChange: (filters: UnifiedFilters) => void, currentFilters?: UnifiedFilters) => {
  // Reset to default state with "Last Year" relative time and corresponding date range
  // but preserve the search_query if it exists
  const defaultDateRange = getDefaultDateRange();
  const defaultFilters: UnifiedFilters = {
    relative_time: 'last_year',
    ...defaultDateRange,
    // Preserve search_query if it exists in current filters
    ...(currentFilters?.search_query && { search_query: currentFilters.search_query })
  };
  onFiltersChange(defaultFilters);
};

export const getActiveFiltersCount = (filters: UnifiedFilters) => {
  // Get default state for comparison
  const defaultDateRange = getDefaultDateRange();
  const isDefaultDateRange = filters.start_date === defaultDateRange?.start_date && 
                            filters.end_date === defaultDateRange?.end_date;
  const isDefaultRelativeTime = (filters.relative_time || 'last_year') === 'last_year';
  
  let count = 0;
  
  // Only count non-default filters (excluding search_query)
  if (filters.service_type?.length) count++;
  if (filters.status?.length) count++;
  if (filters.supplier?.length) count++;
  if (filters.material?.length) count++;
  if (filters.hierarchy_id?.length) count++;
  
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

// Generic toggle function for array filters
export const createToggleFunction = <T>(
  filterKey: keyof UnifiedFilters,
  filters: UnifiedFilters,
  onFiltersChange: (filters: UnifiedFilters) => void
) => {
  return (item: T) => {
    const currentArray = (filters[filterKey] as T[]) || [];
    const newArray = toggleArrayItem(currentArray, item);
    onFiltersChange({
      ...filters,
      [filterKey]: newArray.length > 0 ? newArray : undefined
    });
  };
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