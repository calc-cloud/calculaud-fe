import { BaseQueryParams } from "@/services/BaseService";
import { stageTypeService } from "@/services/stageTypeService";

import { useEntityData } from "./useEntityData";

export const useStageTypes = (params?: BaseQueryParams) => {
  return useEntityData("stageTypes", stageTypeService.getStageTypes.bind(stageTypeService), params);
};
