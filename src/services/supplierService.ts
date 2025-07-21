
import { API_CONFIG } from '@/config/api';
import { 
  Supplier, 
  SuppliersResponse, 
  SupplierCreateRequest, 
  SupplierUpdateRequest 
} from '@/types/suppliers';

import { apiService } from './apiService';

export class SupplierService {
  private endpoint = API_CONFIG.ENDPOINTS.SUPPLIERS;

  async getSuppliers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<SuppliersResponse> {
    return apiService.get<SuppliersResponse>(this.endpoint, params);
  }

  async createSupplier(data: SupplierCreateRequest): Promise<Supplier> {
    return apiService.post<Supplier>(this.endpoint, data);
  }

  async updateSupplier(id: number, data: SupplierUpdateRequest): Promise<Supplier> {
    return apiService.patch<Supplier>(`${this.endpoint}${id}`, data);
  }

  async deleteSupplier(id: number): Promise<void> {
    return apiService.delete<void>(`${this.endpoint}${id}`);
  }
}

export const supplierService = new SupplierService();
