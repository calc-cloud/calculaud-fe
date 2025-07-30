import { BaseEntityWithTimestamps, BaseResponse, BaseCreateRequest, BaseUpdateRequest, BaseFilters } from './base';

// Frontend interface for Material (maps to backend Service)
export interface Material extends BaseEntityWithTimestamps {
  service_type_id: number; // Keep backend field name
}

// Frontend request interfaces (maps to backend Service requests)
export interface MaterialCreateRequest extends BaseCreateRequest {
  service_type_id: number; // Keep backend field name
}

export interface MaterialUpdateRequest extends BaseUpdateRequest {
  service_type_id?: number; // Keep backend field name
}

// Frontend response interface (maps to backend ServicesResponse)
export type MaterialsResponse = BaseResponse<Material>;

export interface MaterialFilters extends BaseFilters {
  service_type_id?: number;
}
