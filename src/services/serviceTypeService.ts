
import { API_CONFIG } from '@/config/api';
import { 
  ServiceType, 
  ServiceTypesResponse, 
  ServiceTypeCreateRequest, 
  ServiceTypeUpdateRequest,
  ServiceTypeFilters
} from '@/types/serviceTypes';

import { BaseEntityService } from './baseEntityService';

export class ServiceTypeService extends BaseEntityService<
  ServiceType,
  ServiceTypeCreateRequest,
  ServiceTypeUpdateRequest,
  ServiceTypeFilters
> {
  constructor() {
    super(API_CONFIG.ENDPOINTS.SERVICE_TYPES);
  }

  async getServiceTypes(params?: ServiceTypeFilters): Promise<ServiceTypesResponse> {
    return this.getAll(params);
  }

  async createServiceType(data: ServiceTypeCreateRequest): Promise<ServiceType> {
    return this.create(data);
  }

  async updateServiceType(id: number, data: ServiceTypeUpdateRequest): Promise<ServiceType> {
    return this.update(id, data);
  }

  async deleteServiceType(id: number): Promise<void> {
    return this.delete(id);
  }
}

export const serviceTypeService = new ServiceTypeService();
