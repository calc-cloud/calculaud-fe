import { TimestampedEntity, PaginatedResponse, EntityCreateRequest, EntityUpdateRequest } from "./base";

export interface ServiceType extends TimestampedEntity {
  name: string;
}

export type ServiceTypeCreateRequest = EntityCreateRequest<{
  name?: string;
}>;

export type ServiceTypeUpdateRequest = EntityUpdateRequest<{
  name?: string;
}>;

// Updated to match actual API response structure
export type ServiceTypesResponse = PaginatedResponse<ServiceType>;
