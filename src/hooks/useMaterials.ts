import { materialService } from "@/services/materialService";

import { useEntityData } from "./useEntityData";

interface MaterialQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  service_type_id?: number;
}

export const useMaterials = (params?: MaterialQueryParams) => {
  return useEntityData("materials", materialService.getMaterials.bind(materialService), params, {
    enabled: (p) => (p?.service_type_id ? p.service_type_id > 0 : true),
  });
};
