import { API_CONFIG } from '@/config/api';
import { 
  Material, 
  MaterialsResponse, 
  MaterialCreateRequest, 
  MaterialUpdateRequest 
} from '@/types/materials';

import { BaseService } from './BaseService';

interface MaterialQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  service_type_id?: number;
}

export class MaterialService extends BaseService<
  Material,
  MaterialsResponse,
  MaterialCreateRequest,
  MaterialUpdateRequest,
  MaterialQueryParams
> {
  protected endpoint = API_CONFIG.ENDPOINTS.SERVICES;

  // Maintain backward compatibility with existing method names
  async getMaterials(params?: MaterialQueryParams): Promise<MaterialsResponse> {
    return this.getEntities(params);
  }

  async createMaterial(data: MaterialCreateRequest): Promise<Material> {
    return this.createEntity(data);
  }

  async updateMaterial(id: number, data: MaterialUpdateRequest): Promise<Material> {
    return this.updateEntity(id, data);
  }

  async deleteMaterial(id: number): Promise<void> {
    return this.deleteEntity(id);
  }
}

export const materialService = new MaterialService();
