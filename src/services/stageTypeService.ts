import { API_CONFIG } from "@/config/api";
import { StageType, StageTypesResponse, StageTypeCreateRequest, StageTypeUpdateRequest } from "@/types/stageTypes";

import { BaseService, BaseQueryParams } from "./BaseService";

export class StageTypeService extends BaseService<
  StageType,
  StageTypesResponse,
  StageTypeCreateRequest,
  StageTypeUpdateRequest,
  BaseQueryParams
> {
  protected endpoint = API_CONFIG.ENDPOINTS.STAGE_TYPES;

  async getStageTypes(params?: BaseQueryParams): Promise<StageTypesResponse> {
    return this.getEntities(params);
  }

  async createStageType(data: StageTypeCreateRequest): Promise<StageType> {
    return this.createEntity(data);
  }

  async updateStageType(id: number, data: StageTypeUpdateRequest): Promise<StageType> {
    return this.updateEntity(id, data);
  }

  async deleteStageType(id: number): Promise<void> {
    return this.deleteEntity(id);
  }
}

export const stageTypeService = new StageTypeService();
