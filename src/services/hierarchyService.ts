
import { API_CONFIG } from '@/config/api';
import { 
  Hierarchy, 
  HierarchiesResponse, 
  HierarchyFilters,
  HierarchyCreateRequest, 
  HierarchyUpdateRequest 
} from '@/types/hierarchies';

import { BaseEntityService } from './baseEntityService';

export class HierarchyService extends BaseEntityService<
  Hierarchy,
  HierarchyCreateRequest,
  HierarchyUpdateRequest,
  HierarchyFilters
> {
  constructor() {
    super(API_CONFIG.ENDPOINTS.HIERARCHIES);
  }

  async getHierarchies(params?: HierarchyFilters): Promise<HierarchiesResponse> {
    return this.getAll(params);
  }

  async createHierarchy(data: HierarchyCreateRequest): Promise<Hierarchy> {
    return this.create(data);
  }

  async updateHierarchy(id: number, data: HierarchyUpdateRequest): Promise<Hierarchy> {
    return this.update(id, data);
  }

  async deleteHierarchy(id: number): Promise<void> {
    return this.delete(id);
  }
}

export const hierarchyService = new HierarchyService();
