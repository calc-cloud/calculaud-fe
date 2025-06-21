
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
    console.log('HierarchyService.createHierarchy called with data:', data);
    return apiService.post<Hierarchy>(this.endpoint, data);
  }

  async updateHierarchy(id: number, data: HierarchyUpdateRequest): Promise<Hierarchy> {
    console.log('HierarchyService.updateHierarchy called with id:', id, 'data:', data);
    // Remove trailing slash and add the ID
    const updateEndpoint = this.endpoint.replace(/\/$/, '') + '/' + id;
    return apiService.patch<Hierarchy>(updateEndpoint, data);
  }

  async deleteHierarchy(id: number): Promise<void> {
    console.log('HierarchyService.deleteHierarchy called with id:', id);
    // Remove trailing slash and add the ID
    const deleteEndpoint = this.endpoint.replace(/\/$/, '') + '/' + id;
    return apiService.delete<void>(deleteEndpoint);
  }
}

export const hierarchyService = new HierarchyService();
