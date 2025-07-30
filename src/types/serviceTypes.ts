
import { BaseEntityWithTimestamps, BaseResponse, BaseCreateRequest, BaseUpdateRequest, BaseFilters } from './base';

export interface ServiceType extends BaseEntityWithTimestamps {
  type: string;
  parent_id?: number;
  path: string;
}

export interface ServiceTypeCreateRequest extends BaseCreateRequest {
  type?: string;
  parent_id?: number;
}

export interface ServiceTypeUpdateRequest extends BaseUpdateRequest {
  type?: string;
  parent_id?: number;
}

// Updated to match actual API response structure
export type ServiceTypesResponse = BaseResponse<ServiceType>;

export type ServiceTypeFilters = BaseFilters;
