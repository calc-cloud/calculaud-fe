import { API_CONFIG } from '@/config/api';
import { 
  Material, 
  MaterialsResponse, 
  MaterialCreateRequest, 
  MaterialUpdateRequest,
  MaterialFilters
} from '@/types/materials';

import { BaseEntityService } from './baseEntityService';

export class MaterialService extends BaseEntityService<
  Material,
  MaterialCreateRequest,
  MaterialUpdateRequest,
  MaterialFilters
> {
  constructor() {
    super(API_CONFIG.ENDPOINTS.SERVICES);
  }

  async getMaterials(params?: MaterialFilters): Promise<MaterialsResponse> {
    return this.getAll(params);
  }

  async createMaterial(data: MaterialCreateRequest): Promise<Material> {
    return this.create(data);
  }

  async updateMaterial(id: number, data: MaterialUpdateRequest): Promise<Material> {
    return this.update(id, data);
  }

  async deleteMaterial(id: number): Promise<void> {
    return this.delete(id);
  }
}

export const materialService = new MaterialService();
