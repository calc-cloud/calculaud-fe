// Pending Authority types for the Procurement Management System
// Note: These authorities are called "responsible_authority" in the API for fetching the list

import { CreatedEntity, PaginatedResponse } from './base';

export interface ResponsibleAuthority extends CreatedEntity {
    description: string;
}

// API Response types
export type ResponsibleAuthoritiesResponse = PaginatedResponse<ResponsibleAuthority>;
