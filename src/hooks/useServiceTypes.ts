import { BaseQueryParams } from "@/services/BaseService";
import { serviceTypeService } from "@/services/serviceTypeService";

import { useEntityData } from "./useEntityData";

export const useServiceTypes = (params?: BaseQueryParams) => {
  return useEntityData(
    "service-types",
    serviceTypeService.getServiceTypes.bind(serviceTypeService),
    params
  );
};
