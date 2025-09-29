import { TimestampedEntity, PaginatedResponse, EntityCreateRequest, EntityUpdateRequest } from "./base";
import { ResponsibleAuthority } from "./responsibleAuthorities";

export interface StageType extends TimestampedEntity {
  display_name: string;
  description: string;
  responsible_authority_id: number;
  responsible_authority: ResponsibleAuthority;
}

export type StageTypeCreateRequest = EntityCreateRequest<{
  display_name: string;
  description: string;
  responsible_authority_id: number;
}>;

export type StageTypeUpdateRequest = EntityUpdateRequest<{
  display_name?: string;
  description?: string;
  responsible_authority_id?: number;
}>;

export type StageTypesResponse = PaginatedResponse<StageType>;
