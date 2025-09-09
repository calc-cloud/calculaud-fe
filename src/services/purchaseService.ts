import { API_CONFIG } from "@/config/api";
import { Purchase, PurchasesResponse, PurchaseCreateRequest, PurchaseUpdateRequest } from "@/types/purchases";

import { BaseService, BaseQueryParams } from "./BaseService";

export class PurchaseService extends BaseService<
  Purchase,
  PurchasesResponse,
  PurchaseCreateRequest,
  PurchaseUpdateRequest,
  BaseQueryParams
> {
  protected endpoint = API_CONFIG.ENDPOINTS.PURCHASES;

  // Maintain backward compatibility with existing method names
  async getPurchases(params?: BaseQueryParams): Promise<PurchasesResponse> {
    return this.getEntities(params);
  }

  async createPurchase(data: PurchaseCreateRequest): Promise<Purchase> {
    return this.createEntity(data);
  }

  async updatePurchase(id: number, data: PurchaseUpdateRequest): Promise<Purchase> {
    return this.updateEntity(id, data);
  }

  async deletePurchase(id: number): Promise<void> {
    return this.deleteEntity(id);
  }
}

export const purchaseService = new PurchaseService();
