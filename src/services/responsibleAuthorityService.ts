import {API_CONFIG} from '@/config/api';
import {ResponsibleAuthoritiesResponse,} from '@/types/responsibleAuthorities';

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
}

export const responsibleAuthorityService = new ResponsibleAuthorityService();