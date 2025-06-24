
import { apiService } from './apiService';
import { DashboardFilters, ServicesQuantityResponse, ServiceTypesDistributionResponse, HierarchyDistributionResponse } from '@/types/analytics';

export class AnalyticsService {
  async getServicesQuantities(filters?: DashboardFilters): Promise<ServicesQuantityResponse> {
    console.log('=== AnalyticsService.getServicesQuantities ===');
    console.log('Input filters:', filters);
    
    const params: Record<string, any> = {};
    
    if (filters) {
      if (filters.start_date) {
        params.start_date = filters.start_date;
        console.log('Added start_date:', filters.start_date);
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
        console.log('Added end_date:', filters.end_date);
      }
      if (filters.service_ids?.length) {
        params.service_ids = filters.service_ids;
        console.log('Added service_ids:', filters.service_ids);
      }
      if (filters.service_type_ids?.length) {
        params.service_type_ids = filters.service_type_ids;
        console.log('Added service_type_ids:', filters.service_type_ids);
      }
      if (filters.hierarchy_ids?.length) {
        params.hierarchy_ids = filters.hierarchy_ids;
        console.log('Added hierarchy_ids:', filters.hierarchy_ids);
      }
      if (filters.status?.length) {
        params.status = filters.status;
        console.log('Added status:', filters.status);
      }
      if (filters.supplier_ids?.length) {
        params.supplier_ids = filters.supplier_ids;
        console.log('Added supplier_ids:', filters.supplier_ids);
      }
    }
    
    console.log('Final params object:', params);
    console.log('Making request to: /analytics/services/quantities');
    
    try {
      const result = await apiService.get<ServicesQuantityResponse>('/analytics/services/quantities', params);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error details:', error);
      throw error;
    }
  }

  async getServiceTypesDistribution(filters?: DashboardFilters): Promise<ServiceTypesDistributionResponse> {
    console.log('=== AnalyticsService.getServiceTypesDistribution ===');
    console.log('Input filters:', filters);
    
    const params: Record<string, any> = {};
    
    if (filters) {
      if (filters.start_date) {
        params.start_date = filters.start_date;
        console.log('Added start_date:', filters.start_date);
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
        console.log('Added end_date:', filters.end_date);
      }
      if (filters.service_ids?.length) {
        params.service_ids = filters.service_ids;
        console.log('Added service_ids:', filters.service_ids);
      }
      if (filters.service_type_ids?.length) {
        params.service_type_ids = filters.service_type_ids;
        console.log('Added service_type_ids:', filters.service_type_ids);
      }
      if (filters.hierarchy_ids?.length) {
        params.hierarchy_ids = filters.hierarchy_ids;
        console.log('Added hierarchy_ids:', filters.hierarchy_ids);
      }
      if (filters.status?.length) {
        params.status = filters.status;
        console.log('Added status:', filters.status);
      }
      if (filters.supplier_ids?.length) {
        params.supplier_ids = filters.supplier_ids;
        console.log('Added supplier_ids:', filters.supplier_ids);
      }
    }
    
    console.log('Final params object:', params);
    console.log('Making request to: /analytics/service-types/distribution');
    
    try {
      const result = await apiService.get<ServiceTypesDistributionResponse>('/analytics/service-types/distribution', params);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error details:', error);
      throw error;
    }
  }

  async getHierarchyDistribution(
    filters?: DashboardFilters, 
    level?: 'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM',
    parent_id?: number
  ): Promise<HierarchyDistributionResponse> {
    console.log('=== AnalyticsService.getHierarchyDistribution ===');
    console.log('Input filters:', filters);
    console.log('Level:', level);
    console.log('Parent ID:', parent_id);
    
    const params: Record<string, any> = {};
    
    if (level) {
      params.level = level;
      console.log('Added level:', level);
    }
    
    if (parent_id) {
      params.parent_id = parent_id;
      console.log('Added parent_id:', parent_id);
    }
    
    if (filters) {
      if (filters.start_date) {
        params.start_date = filters.start_date;
        console.log('Added start_date:', filters.start_date);
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
        console.log('Added end_date:', filters.end_date);
      }
      if (filters.service_ids?.length) {
        params.service_ids = filters.service_ids;
        console.log('Added service_ids:', filters.service_ids);
      }
      if (filters.service_type_ids?.length) {
        params.service_type_ids = filters.service_type_ids;
        console.log('Added service_type_ids:', filters.service_type_ids);
      }
      if (filters.hierarchy_ids?.length) {
        params.hierarchy_ids = filters.hierarchy_ids;
        console.log('Added hierarchy_ids:', filters.hierarchy_ids);
      }
      if (filters.status?.length) {
        params.status = filters.status;
        console.log('Added status:', filters.status);
      }
      if (filters.supplier_ids?.length) {
        params.supplier_ids = filters.supplier_ids;
        console.log('Added supplier_ids:', filters.supplier_ids);
      }
    }
    
    console.log('Final params object:', params);
    console.log('Making request to: /analytics/hierarchies/distribution');
    
    try {
      const result = await apiService.get<HierarchyDistributionResponse>('/analytics/hierarchies/distribution', params);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error details:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
