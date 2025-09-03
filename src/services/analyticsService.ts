import {
  DashboardFilters,
  ServicesQuantityResponse,
  ServiceTypesDistributionResponse,
  StatusDistributionResponse,
  PendingAuthorityDistributionResponse,
} from "@/types/analytics";

import { apiService } from "./apiService";

export class AnalyticsService {
  // Helper method to build filter parameters (eliminates massive duplication)
  private buildFilterParams(filters?: DashboardFilters): Record<string, any> {
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

    return params;
  }

  async getServicesQuantities(filters?: DashboardFilters): Promise<ServicesQuantityResponse> {
    const params = this.buildFilterParams(filters);
    return apiService.get<ServicesQuantityResponse>("/analytics/services/quantities", params);
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
}

export const analyticsService = new AnalyticsService();
