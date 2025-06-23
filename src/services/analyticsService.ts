
import { apiService } from './apiService';
import { DashboardFilters, ServicesQuantityResponse } from '@/types/analytics';

export class AnalyticsService {
  async getServicesQuantities(filters?: DashboardFilters): Promise<ServicesQuantityResponse> {
    const params: Record<string, any> = {};
    
    if (filters) {
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.service_ids?.length) params.service_ids = filters.service_ids;
      if (filters.service_type_ids?.length) params.service_type_ids = filters.service_type_ids;
      if (filters.hierarchy_ids?.length) params.hierarchy_ids = filters.hierarchy_ids;
      if (filters.status?.length) params.status = filters.status;
      if (filters.supplier_ids?.length) params.supplier_ids = filters.supplier_ids;
    }
    
    return apiService.get<ServicesQuantityResponse>('/services/quantities', params);
  }
}

export const analyticsService = new AnalyticsService();
