// Common filter types shared between Search and Dashboard pages

export interface BaseFilters {
  // Date filters
  start_date?: string;
  end_date?: string;
  relative_time?: string;
  
  // Entity filters - using consistent numeric IDs and plural naming
  hierarchy_ids?: number[];
  service_type_ids?: number[];
  supplier_ids?: number[];
  status?: string[];
  service_ids?: number[]; // Materials filter (available on both pages)
}

// Search-specific filters extend base with search functionality
export interface SearchFilters extends BaseFilters {
  search_query?: string;
}

// Dashboard filters are just the base filters (type alias instead of empty interface)
export type DashboardFilters = BaseFilters;

// API parameter interfaces for consistent backend communication
export interface BaseApiParams {
  start_date?: string;
  end_date?: string;
  hierarchy_ids?: number[];
  service_type_ids?: number[];
  supplier_ids?: number[];
  status?: string[];
  service_ids?: number[];
}

export interface SearchApiParams extends BaseApiParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Relative time options used across both pages
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

// Common status options
export const PURPOSE_STATUSES = ['IN_PROGRESS', 'COMPLETED'];