
import { apiService } from './apiService';
import { API_CONFIG } from '@/config/api';
import { 
  Service, 
  ServicesResponse, 
  ServiceCreateRequest, 
  ServiceUpdateRequest 
} from '@/types/services';

export class ServiceService {
  private endpoint = API_CONFIG.ENDPOINTS.SERVICES;

  async getServices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    service_type_id?: number;
  }): Promise<ServicesResponse> {
    return apiService.get<ServicesResponse>(this.endpoint, params);
  }

  async createService(data: ServiceCreateRequest): Promise<Service> {
    return apiService.post<Service>(this.endpoint, data);
  }

  async updateService(id: number, data: ServiceUpdateRequest): Promise<Service> {
    return apiService.patch<Service>(`${this.endpoint}${id}`, data);
  }

  async deleteService(id: number): Promise<void> {
    return apiService.delete<void>(`${this.endpoint}${id}`);
  }
}

export const serviceService = new ServiceService();
