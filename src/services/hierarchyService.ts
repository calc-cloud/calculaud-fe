
import { apiService } from './apiService';
import { API_CONFIG } from '@/config/api';
import { 
  Hierarchy, 
  HierarchiesResponse, 
  HierarchyFilters,
  HierarchyCreateRequest, 
  HierarchyUpdateRequest 
} from '@/types/hierarchies';

export class HierarchyService {
  private endpoint = API_CONFIG.ENDPOINTS.HIERARCHIES;

  constructor() {
    console.log('HierarchyService constructor - endpoint:', this.endpoint);
  }

  async getHierarchies(params?: HierarchyFilters): Promise<HierarchiesResponse> {
    console.log('HierarchyService.getHierarchies called with params:', params);
    return apiService.get<HierarchiesResponse>(this.endpoint, params);
  }

  async createHierarchy(data: HierarchyCreateRequest): Promise<Hierarchy> {
    return apiService.post<Hierarchy>(this.endpoint, data);
  }

  async updateHierarchy(id: number, data: HierarchyUpdateRequest): Promise<Hierarchy> {
    return apiService.patch<Hierarchy>(`${this.endpoint}${id}`, data);
  }

  async deleteHierarchy(id: number): Promise<void> {
    return apiService.delete<void>(`${this.endpoint}${id}`);
  }
}

export const hierarchyService = new HierarchyService();
