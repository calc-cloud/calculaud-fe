
export interface ServiceType {
  id: number;
  name: string;
  type: string;
  parent_id?: number;
  path: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceTypeCreateRequest {
  name: string;
  type?: string;
  parent_id?: number;
}

export interface ServiceTypeUpdateRequest {
  name?: string;
  type?: string;
  parent_id?: number;
}

// Updated to match actual API response structure
export interface ServiceTypesResponse {
  items: ServiceType[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
