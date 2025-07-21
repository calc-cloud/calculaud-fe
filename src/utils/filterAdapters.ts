// Filter adapters to convert between different filter formats
import { DashboardFilters } from '@/types/analytics';
import { UnifiedFilters } from '@/types/filters';

// Status mapping for dashboard API compatibility
const STATUS_DISPLAY_TO_API: Record<string, string> = {
  'In Progress': 'IN_PROGRESS',
  'Completed': 'COMPLETED'
};

const STATUS_API_TO_DISPLAY: Record<string, string> = {
  'IN_PROGRESS': 'In Progress',
  'COMPLETED': 'Completed'
};

// Convert DashboardFilters to UnifiedFilters (API format to display format)
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

// Convert UnifiedFilters to DashboardFilters (display format to API format)
export const unifiedToDashboardFilters = (filters: UnifiedFilters): DashboardFilters => {
  return {
    start_date: filters.start_date,
    end_date: filters.end_date,
    relative_time: filters.relative_time,
    hierarchy_id: filters.hierarchy_id,
    service_type_id: filters.service_type,
    supplier_id: filters.supplier,
    status: filters.status?.map(status => STATUS_DISPLAY_TO_API[status] || status),
    service_id: filters.material, // material maps to service_id in dashboard context
  };
}; 