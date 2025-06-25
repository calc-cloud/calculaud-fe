// Shared filter types for unified filtering across search and dashboard

export interface UnifiedFilters {
  // Date/time filters
  start_date?: string;
  end_date?: string;
  relative_time?: string;
  
  // Entity filters - using arrays for consistency
  hierarchy_id?: string[] | number[]; // Support both string and number arrays
  service_type?: string[] | number[]; // Support both name strings and IDs
  supplier?: string[] | number[]; // Support both name strings and IDs
  status?: string[];
  material?: string[] | number[]; // Maps to service_id in some contexts
  
  // Search specific
  search_query?: string;
}

export interface FilterConfig {
  mode: 'search' | 'dashboard';
  showExport?: boolean;
  showSearch?: boolean;
  filterOrder?: FilterType[];
  containerClassName?: string;
  showDateRange?: boolean;
}

export type FilterType = 
  | 'hierarchy' 
  | 'service_type' 
  | 'material' 
  | 'supplier' 
  | 'status';

export interface FilterComponentProps {
  filters: UnifiedFilters;
  onFiltersChange: (filters: UnifiedFilters) => void;
  onExport?: () => void;
  config: FilterConfig;
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

// Purpose statuses - shared constants for display
export const PURPOSE_STATUSES_DISPLAY = ['In Progress', 'Completed'];

// Purpose statuses mapping - display to API values
export const STATUS_DISPLAY_TO_API: Record<string, string> = {
  'In Progress': 'IN_PROGRESS',
  'Completed': 'COMPLETED'
};

// Purpose statuses mapping - API to display values
export const STATUS_API_TO_DISPLAY: Record<string, string> = {
  'IN_PROGRESS': 'In Progress',
  'COMPLETED': 'Completed'
}; 