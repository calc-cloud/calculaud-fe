export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://calcloud-api-production.up.railway.app/api/v1",
  ENDPOINTS: {
    SERVICE_TYPES: "/service-types/",
    SUPPLIERS: "/suppliers/",
    HIERARCHIES: "/hierarchies/",
    SERVICES: "/services/",
    RESPONSIBLE_AUTHORITIES: "/responsible-authorities/",
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
  },
  SEARCH: {
    DEBOUNCE_DELAY: 300,
  },
};
