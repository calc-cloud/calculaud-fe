import { BaseEntity, PaginatedResponse } from './base';

export type HierarchyType = 'UNIT' | 'CENTER' | 'ANAF' | 'TEAM' | 'MADOR';

export interface Hierarchy extends BaseEntity {
  type: HierarchyType;
  parent_id: number | null;
  path: string;
}

export type HierarchiesResponse = PaginatedResponse<Hierarchy>;

export interface HierarchyFilters {
  page?: number;
  limit?: number;
  type?: HierarchyType;
  parent_id?: number;
  search?: string;
  sort_by?: 'name' | 'type';
  sort_order?: 'asc' | 'desc';
}

export interface HierarchyCreateRequest {
  type: HierarchyType;
  name: string;
  parent_id?: number | null;
}

export interface HierarchyUpdateRequest {
  type?: HierarchyType;
  name?: string;
  parent_id?: number | null;
}
