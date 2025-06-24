import { apiService } from './apiService';
import { API_CONFIG } from '@/config/api';
import { 
  Material, 
  MaterialsResponse, 
  MaterialCreateRequest, 
  MaterialUpdateRequest 
} from '@/types/materials';

export class MaterialService {
  private endpoint = API_CONFIG.ENDPOINTS.SERVICES;

  async getMaterials(params?: {
    page?: number;
    limit?: number;
    search?: string;
    service_type_id?: number;
  }): Promise<MaterialsResponse> {
    return apiService.get<MaterialsResponse>(this.endpoint, params);
  }

  async createMaterial(data: MaterialCreateRequest): Promise<Material> {
    return apiService.post<Material>(this.endpoint, data);
  }

  async updateMaterial(id: number, data: MaterialUpdateRequest): Promise<Material> {
    return apiService.patch<Material>(`${this.endpoint}${id}`, data);
  }

  async deleteMaterial(id: number): Promise<void> {
    return apiService.delete<void>(`${this.endpoint}${id}`);
  }
}

export const materialService = new MaterialService();
