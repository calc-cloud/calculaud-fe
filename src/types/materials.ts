import { TimestampedEntity, PaginatedResponse, EntityCreateRequest, EntityUpdateRequest } from './base';

// Frontend interface for Material (maps to backend Service)
export interface Material extends TimestampedEntity {
  service_type_id: number; // Keep backend field name
}

// Frontend request interfaces (maps to backend Service requests)
export type MaterialCreateRequest = EntityCreateRequest<{
  service_type_id: number; // Keep backend field name
}>;

export type MaterialUpdateRequest = EntityUpdateRequest<{
  service_type_id?: number; // Keep backend field name
}>;

// Frontend response interface (maps to backend ServicesResponse)
export type MaterialsResponse = PaginatedResponse<Material>;

 