import { API_CONFIG } from "@/config/api";
import { Supplier, SuppliersResponse, SupplierCreateRequest, SupplierUpdateRequest } from "@/types/suppliers";

import { BaseService, BaseQueryParams } from "./BaseService";

export class SupplierService extends BaseService<
  Supplier,
  SuppliersResponse,
  SupplierCreateRequest,
  SupplierUpdateRequest,
  BaseQueryParams
> {
  protected endpoint = API_CONFIG.ENDPOINTS.SUPPLIERS;

  // Maintain backward compatibility with existing method names
  async getSuppliers(params?: BaseQueryParams): Promise<SuppliersResponse> {
    return this.getEntities(params);
  }

  async createSupplier(data: SupplierCreateRequest): Promise<Supplier> {
    return this.createEntity(data);
  }

  async updateSupplier(id: number, data: SupplierUpdateRequest): Promise<Supplier> {
    return this.updateEntity(id, data);
  }

  async deleteSupplier(id: number): Promise<void> {
    return this.deleteEntity(id);
  }
}

export const supplierService = new SupplierService();
