
export interface Supplier {
  id: number;
  name: string;
}

export interface SupplierCreateRequest {
  name: string;
}

export interface SupplierUpdateRequest {
  name?: string;
}

export interface SuppliersResponse {
  items: Supplier[];
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
