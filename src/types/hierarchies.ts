export type HierarchyType = 'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM';

export interface Hierarchy {
  id: number;
  type: HierarchyType;
  name: string;
  parent_id: number | null;
  path: string;
}

export interface HierarchiesResponse {
  items: Hierarchy[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
  pages: number;
}

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
