// Filter adapters to convert between different filter formats
import { UnifiedFilters, STATUS_DISPLAY_TO_API, STATUS_API_TO_DISPLAY } from '@/types/filters';
import { PurposeFilters } from '@/types/index';
import { DashboardFilters } from '@/types/analytics';

// Convert PurposeFilters to UnifiedFilters
export const purposeFiltersToUnified = (filters: PurposeFilters): UnifiedFilters => {
  return {
    start_date: filters.start_date,
    end_date: filters.end_date,
    relative_time: filters.relative_time,
    hierarchy_id: Array.isArray(filters.hierarchy_id) ? filters.hierarchy_id : (filters.hierarchy_id ? [filters.hierarchy_id] : undefined),
    service_type: filters.service_type,
    supplier: filters.supplier,
    status: filters.status?.map(status => STATUS_API_TO_DISPLAY[status] || status),
    material: filters.material,
    search_query: filters.search_query
  };
};

// Convert UnifiedFilters to PurposeFilters
export const unifiedToPurposeFilters = (filters: UnifiedFilters): PurposeFilters => {
  return {
    start_date: filters.start_date,
    end_date: filters.end_date,
    relative_time: filters.relative_time,
    hierarchy_id: filters.hierarchy_id as string | string[],
    service_type: filters.service_type as any[],
    supplier: filters.supplier as any[],
    status: filters.status?.map(status => STATUS_DISPLAY_TO_API[status] || status) as any[],
    material: filters.material as string[],
    search_query: filters.search_query
  };
};

// Convert DashboardFilters to UnifiedFilters
export const dashboardFiltersToUnified = (filters: DashboardFilters): UnifiedFilters => {
  return {
    start_date: filters.start_date,
    end_date: filters.end_date,
    relative_time: filters.relative_time,
    hierarchy_id: filters.hierarchy_id,
    service_type: filters.service_type_id,
    supplier: filters.supplier_id,
    status: filters.status?.map(status => STATUS_API_TO_DISPLAY[status] || status),
    material: filters.service_id, // service_id maps to material in dashboard context
  };
};

// Convert UnifiedFilters to DashboardFilters
export const unifiedToDashboardFilters = (filters: UnifiedFilters): DashboardFilters => {
  return {
    start_date: filters.start_date,
    end_date: filters.end_date,
    relative_time: filters.relative_time,
    hierarchy_id: filters.hierarchy_id as number[],
    service_type_id: filters.service_type as number[],
    supplier_id: filters.supplier as number[],
    status: filters.status?.map(status => STATUS_DISPLAY_TO_API[status] || status),
    service_id: filters.material as number[], // material maps to service_id in dashboard context
  };
}; 