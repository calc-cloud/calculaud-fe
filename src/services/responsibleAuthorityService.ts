import { API_CONFIG } from "@/config/api";
import {
  ResponsibleAuthority,
  ResponsibleAuthoritiesResponse,
} from "@/types/responsibleAuthorities";

import { BaseReadOnlyService, BaseQueryParams } from "./BaseService";

export class ResponsibleAuthorityService extends BaseReadOnlyService<
  ResponsibleAuthority,
  ResponsibleAuthoritiesResponse,
  BaseQueryParams
> {
  protected endpoint = API_CONFIG.ENDPOINTS.RESPONSIBLE_AUTHORITIES;

  // Maintain backward compatibility with existing method names
  async getResponsibleAuthorities(
    params?: BaseQueryParams
  ): Promise<ResponsibleAuthoritiesResponse> {
    return this.getEntities(params);
  }
}

export const responsibleAuthorityService = new ResponsibleAuthorityService();
