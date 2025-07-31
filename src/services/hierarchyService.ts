
import { API_CONFIG } from '@/config/api';
import { 
  Hierarchy, 
  HierarchiesResponse, 
  HierarchyFilters,
  HierarchyCreateRequest, 
  HierarchyUpdateRequest 
} from '@/types/hierarchies';

import { BaseService } from './BaseService';

export class HierarchyService extends BaseService<
  Hierarchy,
  HierarchiesResponse,
  HierarchyCreateRequest,
  HierarchyUpdateRequest,
  HierarchyFilters
> {
  protected endpoint = API_CONFIG.ENDPOINTS.HIERARCHIES;

  // Maintain backward compatibility with existing method names
  async getHierarchies(params?: HierarchyFilters): Promise<HierarchiesResponse> {
    return this.getEntities(params);
  }

  async createHierarchy(data: HierarchyCreateRequest): Promise<Hierarchy> {
    return this.createEntity(data);
  }

  async updateHierarchy(id: number, data: HierarchyUpdateRequest): Promise<Hierarchy> {
    return this.updateEntity(id, data);
  }

  async deleteHierarchy(id: number): Promise<void> {
    return this.deleteEntity(id);
  }
}

export const hierarchyService = new HierarchyService();
