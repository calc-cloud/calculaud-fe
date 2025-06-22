
export interface Service {
  id: number;
  name: string;
  service_type_id: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreateRequest {
  name: string;
  service_type_id: number;
}

export interface ServiceUpdateRequest {
  name?: string;
  service_type_id?: number;
}

export interface ServicesResponse {
  items: Service[];
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
