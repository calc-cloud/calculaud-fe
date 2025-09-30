import { PaginatedResponse } from "./base";
import { ResponsibleAuthority } from "./responsibleAuthorities";

export interface StageType {
  id: number;
  name: string;
  display_name: string;
  description: string;
  value_required: boolean;
  responsible_authority_id: number;
  created_at: string;
  responsible_authority: ResponsibleAuthority;
}

export interface StageTypeRequest {
  name: string;
  display_name: string;
  description: string;
  value_required: boolean;
  responsible_authority_id: number;
}

export interface StageTypeUpdateRequest {
  name?: string;
  display_name?: string;
  description?: string;
  value_required?: boolean;
  responsible_authority_id?: number;
}

export type StageTypesResponse = PaginatedResponse<StageType>;
