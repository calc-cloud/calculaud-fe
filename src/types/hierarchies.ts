import { BaseEntity, BaseResponse, BaseCreateRequest, BaseUpdateRequest, BaseSortFilters } from './base';

export type HierarchyType = 'UNIT' | 'CENTER' | 'ANAF' | 'TEAM' | 'MADOR';

export interface Hierarchy extends BaseEntity {
  type: HierarchyType;
  parent_id: number | null;
  path: string;
}

export type HierarchiesResponse = BaseResponse<Hierarchy>;

export interface HierarchyFilters extends BaseSortFilters {
  type?: HierarchyType;
  parent_id?: number;
  sort_by?: 'name' | 'type';
}

export interface HierarchyCreateRequest extends BaseCreateRequest {
  type: HierarchyType;
  parent_id?: number | null;
}

export interface HierarchyUpdateRequest extends BaseUpdateRequest {
  type?: HierarchyType;
  parent_id?: number | null;
}
