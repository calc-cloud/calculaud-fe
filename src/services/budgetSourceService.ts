import { API_CONFIG } from "@/config/api";
import { BudgetSource, BudgetSourcesResponse, BudgetSourceCreateRequest, BudgetSourceUpdateRequest } from "@/types/budgetSources";

import { BaseService, BaseQueryParams } from "./BaseService";

export class BudgetSourceService extends BaseService<
  BudgetSource,
  BudgetSourcesResponse,
  BudgetSourceCreateRequest,
  BudgetSourceUpdateRequest,
  BaseQueryParams
> {
  protected endpoint = API_CONFIG.ENDPOINTS.BUDGET_SOURCES;

  async getBudgetSources(params?: BaseQueryParams): Promise<BudgetSourcesResponse> {
    return this.getEntities(params);
  }

  async createBudgetSource(data: BudgetSourceCreateRequest): Promise<BudgetSource> {
    return this.createEntity(data);
  }

  async updateBudgetSource(id: number, data: BudgetSourceUpdateRequest): Promise<BudgetSource> {
    return this.updateEntity(id, data);
  }

  async deleteBudgetSource(id: number): Promise<void> {
    return this.deleteEntity(id);
  }
}

export const budgetSourceService = new BudgetSourceService();