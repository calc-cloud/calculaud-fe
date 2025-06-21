
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

export interface ServiceTypesResponse {
  data: ServiceType[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
