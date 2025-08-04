import { BaseQueryParams } from "@/services/BaseService";
import { responsibleAuthorityService } from "@/services/responsibleAuthorityService";

import { useEntityItems } from "./useEntityData";

// Hook for fetching pending authorities (called responsible_authority in API)
export const useResponsibleAuthorities = (params?: BaseQueryParams) => {
  const query = useEntityItems(
    "responsible-authorities",
    responsibleAuthorityService.getResponsibleAuthorities.bind(
      responsibleAuthorityService
    ),
    params,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    responsibleAuthorities: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
