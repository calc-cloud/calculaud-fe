
import { API_CONFIG } from '@/config/api';
import { 
  Supplier, 
  SuppliersResponse, 
  SupplierCreateRequest, 
  SupplierUpdateRequest,
  SupplierFilters
} from '@/types/suppliers';

import { BaseEntityService } from './baseEntityService';

export class SupplierService extends BaseEntityService<
  Supplier,
  SupplierCreateRequest,
  SupplierUpdateRequest,
  SupplierFilters
> {
  constructor() {
    super(API_CONFIG.ENDPOINTS.SUPPLIERS);
  }

  async getSuppliers(params?: SupplierFilters): Promise<SuppliersResponse> {
    return this.getAll(params);
  }

  async createSupplier(data: SupplierCreateRequest): Promise<Supplier> {
    return this.create(data);
  }

  async updateSupplier(id: number, data: SupplierUpdateRequest): Promise<Supplier> {
    return this.update(id, data);
  }

  async deleteSupplier(id: number): Promise<void> {
    return this.delete(id);
  }
}

export const supplierService = new SupplierService();
