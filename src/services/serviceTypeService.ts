
import { API_CONFIG } from '@/config/api';
import { 
  ServiceType, 
  ServiceTypesResponse, 
  ServiceTypeCreateRequest, 
  ServiceTypeUpdateRequest 
} from '@/types/serviceTypes';

import { BaseService, BaseQueryParams } from './BaseService';

export class ServiceTypeService extends BaseService<
  ServiceType,
  ServiceTypesResponse,
  ServiceTypeCreateRequest,
  ServiceTypeUpdateRequest,
  BaseQueryParams
> {
  protected endpoint = API_CONFIG.ENDPOINTS.SERVICE_TYPES;

  // Maintain backward compatibility with existing method names
  async getServiceTypes(params?: BaseQueryParams): Promise<ServiceTypesResponse> {
    return this.getEntities(params);
  }

  async createServiceType(data: ServiceTypeCreateRequest): Promise<ServiceType> {
    return this.createEntity(data);
  }

  async updateServiceType(id: number, data: ServiceTypeUpdateRequest): Promise<ServiceType> {
    return this.updateEntity(id, data);
  }

  async deleteServiceType(id: number): Promise<void> {
    return this.deleteEntity(id);
  }
}

export const serviceTypeService = new ServiceTypeService();
