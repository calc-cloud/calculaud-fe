// Frontend interface for Material (maps to backend Service)
export interface Material {
  id: number;
  name: string;
  service_type_id: number; // Keep backend field name
  created_at: string;
  updated_at: string;
}

// Frontend request interfaces (maps to backend Service requests)
export interface MaterialCreateRequest {
  name: string;
  service_type_id: number; // Keep backend field name
}

export interface MaterialUpdateRequest {
  name?: string;
  service_type_id?: number; // Keep backend field name
}

// Frontend response interface (maps to backend ServicesResponse)
export interface MaterialsResponse {
  items: Material[];
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