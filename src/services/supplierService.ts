
import { apiService } from './apiService';
import { API_CONFIG } from '@/config/api';
import { 
  Supplier, 
  SuppliersResponse, 
  SupplierCreateRequest, 
  SupplierUpdateRequest 
} from '@/types/suppliers';

export class SupplierService {
  private endpoint = API_CONFIG.ENDPOINTS.SUPPLIERS;

  constructor() {
    console.log('SupplierService constructor - Full API_CONFIG:', API_CONFIG);
    console.log('SupplierService constructor - API_CONFIG.ENDPOINTS:', API_CONFIG.ENDPOINTS);
    console.log('SupplierService constructor - SUPPLIERS endpoint:', API_CONFIG.ENDPOINTS.SUPPLIERS);
    console.log('SupplierService constructor - this.endpoint:', this.endpoint);
  }

  async getSuppliers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<SuppliersResponse> {
    console.log('SupplierService.getSuppliers called with params:', params);
    console.log('Making request to endpoint:', this.endpoint);
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
