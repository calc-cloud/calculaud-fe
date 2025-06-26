// Shared filter types for unified filtering across search and dashboard

export interface UnifiedFilters {
  // Date/time filters
  start_date?: string;
  end_date?: string;
  relative_time?: string;
  
  // Entity filters - using number arrays consistently
  hierarchy_id?: number[];
  service_type?: number[];
  supplier?: number[];
  status?: string[];
  material?: number[];
  
  // Search specific
  search_query?: string;
}

// Relative time options - shared across components
export const RELATIVE_TIME_OPTIONS = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'all_time', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' }
];

// Purpose statuses - using display format consistently
export const PURPOSE_STATUSES_DISPLAY = ['In Progress', 'Completed']; 