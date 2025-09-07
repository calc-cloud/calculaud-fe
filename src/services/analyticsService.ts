import {
  DashboardFilters,
  ServiceQuantitiesResponse,
  ServiceTypesDistributionResponse,
  ServiceTypesPerformanceDistributionResponse,
  StatusDistributionResponse,
  PendingAuthorityDistributionResponse,
  PendingStagesDistributionResponse,
} from "@/types/analytics";

import { apiService } from "./apiService";

export class AnalyticsService {
  private buildFilterParams(filters?: DashboardFilters): Record<string, any> {
    const params: Record<string, any> = {};

    if (filters) {
      // Time filters
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }
      // Service type filters
      if (filters.service_type_id?.length) {
        params.service_type_id = filters.service_type_id;
      }
    }

    return params;
  }

  async getServicesQuantities(filters?: DashboardFilters): Promise<ServiceQuantitiesResponse> {
    const params = this.buildFilterParams(filters);
    return apiService.get<ServiceQuantitiesResponse>("/analytics/services/quantities", params);
  }

  async getServiceTypesDistribution(filters?: DashboardFilters): Promise<ServiceTypesDistributionResponse> {
    const params = this.buildFilterParams(filters);
    return apiService.get<ServiceTypesDistributionResponse>("/analytics/service-types/distribution", params);
  }

  async getStatusesDistribution(filters?: DashboardFilters): Promise<StatusDistributionResponse> {
    const params = this.buildFilterParams(filters);
    return apiService.get<StatusDistributionResponse>("/analytics/statuses/distribution", params);
  }

  async getPendingAuthoritiesDistribution(filters?: DashboardFilters): Promise<PendingAuthorityDistributionResponse> {
    const params = this.buildFilterParams(filters);
    return apiService.get<PendingAuthorityDistributionResponse>("/analytics/pending-authorities/distribution", params);
  }

  async getPendingStagesDistribution(filters?: DashboardFilters): Promise<PendingStagesDistributionResponse> {
    const params = this.buildFilterParams(filters);
    return apiService.get<PendingStagesDistributionResponse>("/analytics/pending-stages/distribution", params);
  }

  async getServiceTypesPerformanceDistribution(status: 'SIGNED' | 'COMPLETED', filters?: DashboardFilters): Promise<ServiceTypesPerformanceDistributionResponse> {
    const params = this.buildFilterParams(filters);
    return apiService.get<ServiceTypesPerformanceDistributionResponse>(`/analytics/service-types/${status}/distribution`, params);
  }
}

export const analyticsService = new AnalyticsService();
