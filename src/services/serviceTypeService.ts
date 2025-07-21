
import { API_CONFIG } from '@/config/api';
import { 
  ServiceType, 
  ServiceTypesResponse, 
  ServiceTypeCreateRequest, 
  ServiceTypeUpdateRequest 
} from '@/types/serviceTypes';

import { apiService } from './apiService';

export class ServiceTypeService {
  private endpoint = API_CONFIG.ENDPOINTS.SERVICE_TYPES;

  async getServiceTypes(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ServiceTypesResponse> {
    return apiService.get<ServiceTypesResponse>(this.endpoint, params);
  }

  async createServiceType(data: ServiceTypeCreateRequest): Promise<ServiceType> {
    return apiService.post<ServiceType>(this.endpoint, data);
  }

  async updateServiceType(id: number, data: ServiceTypeUpdateRequest): Promise<ServiceType> {
    return apiService.patch<ServiceType>(`${this.endpoint}${id}`, data);
  }

  async deleteServiceType(id: number): Promise<void> {
    return apiService.delete<void>(`${this.endpoint}${id}`);
  }
}

export const serviceTypeService = new ServiceTypeService();
