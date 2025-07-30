// Pending Authority types for the Procurement Management System
// Note: These authorities are called "responsible_authority" in the API for fetching the list

export interface ResponsibleAuthority {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

// API Response types
export interface ResponsibleAuthoritiesResponse {
    items: ResponsibleAuthority[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
}
