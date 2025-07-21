import { DashboardFilters, ServicesQuantityResponse, ServiceTypesDistributionResponse, HierarchyDistributionResponse, ExpenditureTimelineResponse } from '@/types/analytics';

import { apiService } from './apiService';

export class AnalyticsService {
  async getServicesQuantities(filters?: DashboardFilters): Promise<ServicesQuantityResponse> {
    const params: Record<string, any> = {};
    
    if (filters) {
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }
      if (filters.service_id?.length) {
        params.service_id = filters.service_id;
      }
      if (filters.service_type_id?.length) {
        params.service_type_id = filters.service_type_id;
      }
      if (filters.hierarchy_id?.length) {
        params.hierarchy_id = filters.hierarchy_id;
      }
      if (filters.status?.length) {
        params.status = filters.status;
      }
      if (filters.supplier_id?.length) {
        params.supplier_id = filters.supplier_id;
      }
    }
    
    const result = await apiService.get<ServicesQuantityResponse>('/analytics/services/quantities', params);
    return result;
  }

  async getServiceTypesDistribution(filters?: DashboardFilters): Promise<ServiceTypesDistributionResponse> {
    const params: Record<string, any> = {};
    
    if (filters) {
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }
      if (filters.service_id?.length) {
        params.service_id = filters.service_id;
      }
      if (filters.service_type_id?.length) {
        params.service_type_id = filters.service_type_id;
      }
      if (filters.hierarchy_id?.length) {
        params.hierarchy_id = filters.hierarchy_id;
      }
      if (filters.status?.length) {
        params.status = filters.status;
      }
      if (filters.supplier_id?.length) {
        params.supplier_id = filters.supplier_id;
      }
    }
    
    const result = await apiService.get<ServiceTypesDistributionResponse>('/analytics/service-types/distribution', params);
    return result;
  }

  async getHierarchyDistribution(
    filters?: DashboardFilters, 
    level?: 'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM' | null,
    parent_id?: number | null
  ): Promise<HierarchyDistributionResponse> {
    const params: Record<string, any> = {};
    
    // Only add level if it's not null or undefined
    if (level !== null && level !== undefined) {
      params.level = level;
    }
    
    // Only add parent_id if it's not null
    if (parent_id !== null && parent_id !== undefined) {
      params.parent_id = parent_id;
    }
    
    if (filters) {
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }
      if (filters.service_id?.length) {
        params.service_id = filters.service_id;
      }
      if (filters.service_type_id?.length) {
        params.service_type_id = filters.service_type_id;
      }
      if (filters.hierarchy_id?.length) {
        params.hierarchy_id = filters.hierarchy_id;
      }
      if (filters.status?.length) {
        params.status = filters.status;
      }
      if (filters.supplier_id?.length) {
        params.supplier_id = filters.supplier_id;
      }
    }
    
    const result = await apiService.get<HierarchyDistributionResponse>('/analytics/hierarchies/distribution', params);
    return result;
  }

  async getExpenditureTimeline(
    filters?: DashboardFilters,
    groupBy: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<ExpenditureTimelineResponse> {
    const params: Record<string, any> = {
      group_by: groupBy
    };
    
    if (filters) {
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }
      if (filters.service_id?.length) {
        params.service_id = filters.service_id;
      }
      if (filters.service_type_id?.length) {
        params.service_type_id = filters.service_type_id;
      }
      if (filters.hierarchy_id?.length) {
        params.hierarchy_id = filters.hierarchy_id;
      }
      if (filters.status?.length) {
        params.status = filters.status;
      }
      if (filters.supplier_id?.length) {
        params.supplier_id = filters.supplier_id;
      }
    }
    
    const result = await apiService.get<ExpenditureTimelineResponse>('/analytics/expenditure/timeline', params);
    return result;
  }
}

export const analyticsService = new AnalyticsService();
