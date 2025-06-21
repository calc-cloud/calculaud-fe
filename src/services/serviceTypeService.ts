
import { apiService } from './apiService';
import { API_CONFIG } from '@/config/api';
import { 
  ServiceType, 
  ServiceTypesResponse, 
  ServiceTypeCreateRequest, 
  ServiceTypeUpdateRequest 
} from '@/types/serviceTypes';

export class ServiceTypeService {
  private endpoint = API_CONFIG.ENDPOINTS.SERVICE_TYPES;

  async getServiceTypes(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ServiceTypesResponse> {
    console.log('ServiceTypeService.getServiceTypes called with params:', params);
    console.log('Making request to endpoint:', this.endpoint);
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
