import { BaseQueryParams } from "@/services/BaseService";
import { budgetSourceService } from "@/services/budgetSourceService";
import { BudgetSource, BudgetSourcesResponse, BudgetSourceCreateRequest, BudgetSourceUpdateRequest } from "@/types/budgetSources";

import BudgetSourceModal from "./BudgetSourceModal";
import { EntityManagement, EntityManagementConfig } from "./EntityManagement";

const BudgetSourceManagement: React.FC = () => {
  const config: EntityManagementConfig<
    BudgetSource,
    BudgetSourcesResponse,
    BudgetSourceCreateRequest,
    BudgetSourceUpdateRequest,
    BaseQueryParams
  > = {
    entityName: "Budget Source",
    entityNamePlural: "Budget Sources",
    queryKey: "budgetSources",

    service: {
      get: budgetSourceService.getBudgetSources.bind(budgetSourceService),
      create: budgetSourceService.createBudgetSource.bind(budgetSourceService),
      update: budgetSourceService.updateBudgetSource.bind(budgetSourceService),
      delete: budgetSourceService.deleteBudgetSource.bind(budgetSourceService),
    },

    displayFields: [
      {
        key: "name",
        label: "Name",
        className: "font-medium truncate",
      },
    ],

    searchPlaceholder: "Search budget sources...",
    gridColumns: 3,

    ModalComponent: BudgetSourceModal,
  };

  return <EntityManagement config={config} />;
};

export default BudgetSourceManagement;