import {
  TimestampedEntity,
  PaginatedResponse,
  EntityCreateRequest,
  EntityUpdateRequest,
} from "./base";

export interface ServiceType extends TimestampedEntity {
  type: string;
  parent_id?: number;
  path: string;
}

export type ServiceTypeCreateRequest = EntityCreateRequest<{
  type?: string;
  parent_id?: number;
}>;

export type ServiceTypeUpdateRequest = EntityUpdateRequest<{
  type?: string;
  parent_id?: number;
}>;

// Updated to match actual API response structure
export type ServiceTypesResponse = PaginatedResponse<ServiceType>;
