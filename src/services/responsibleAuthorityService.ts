import {API_CONFIG} from '@/config/api';
import {
  ResponsibleAuthoritiesResponse,
  ResponsibleAuthority,
  ResponsibleAuthorityCreateRequest,
  ResponsibleAuthorityUpdateRequest
} from '@/types/responsibleAuthorities';

import {apiService} from './apiService';

export class ResponsibleAuthorityService {
    private endpoint = API_CONFIG.ENDPOINTS.RESPONSIBLE_AUTHORITIES;

    async getResponsibleAuthorities(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<ResponsibleAuthoritiesResponse> {
        return apiService.get<ResponsibleAuthoritiesResponse>(this.endpoint, params);
    }

    async createResponsibleAuthority(data: ResponsibleAuthorityCreateRequest): Promise<ResponsibleAuthority> {
        return apiService.post<ResponsibleAuthority>(this.endpoint, data);
    }

    async updateResponsibleAuthority(id: number, data: ResponsibleAuthorityUpdateRequest): Promise<ResponsibleAuthority> {
        return apiService.patch<ResponsibleAuthority>(`${this.endpoint}${id}`, data);
    }

    async deleteResponsibleAuthority(id: number): Promise<void> {
        return apiService.delete<void>(`${this.endpoint}${id}`);
    }
}

export const responsibleAuthorityService = new ResponsibleAuthorityService();