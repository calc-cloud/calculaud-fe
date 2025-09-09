import { BaseQueryParams } from "@/services/BaseService";
import { budgetSourceService } from "@/services/budgetSourceService";

import { useEntityData } from "./useEntityData";

export const useBudgetSources = (params?: BaseQueryParams) => {
  return useEntityData("budgetSources", budgetSourceService.getBudgetSources.bind(budgetSourceService), params);
};