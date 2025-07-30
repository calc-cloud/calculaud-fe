// Base interfaces for common entity patterns to reduce duplication

export interface BaseEntity {
  id: number;
  name: string;
}

export interface BaseEntityWithTimestamps extends BaseEntity {
  created_at: string;
  updated_at: string;
}

export interface BaseCreateRequest {
  name: string;
}

export interface BaseUpdateRequest {
  name?: string;
}

export interface BaseResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BaseSortFilters extends BaseFilters {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}