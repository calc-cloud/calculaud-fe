import { BaseQueryParams } from "@/services/BaseService";
import { stageTypeService } from "@/services/stageTypeService";
import { StageType, StageTypesResponse, StageTypeCreateRequest, StageTypeUpdateRequest } from "@/types/stageTypes";

import { EntityManagement, EntityManagementConfig } from "./EntityManagement";
import StageTypeModal from "./StageTypeModal";

// Adapter component to bridge StageTypeModal interface with EntityManagement
const StageTypeModalAdapter: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: StageType | null;
  onSave: (data: StageTypeCreateRequest | StageTypeUpdateRequest, editId?: number) => Promise<void>;
}> = ({ open, onOpenChange, editItem, onSave }) => {
  const handleSave = async (
    data: {
      name: string;
      display_name: string;
      description: string;
      responsible_authority_id: number;
    },
    editId?: number
  ) => {
    await onSave(data, editId);
  };

  return <StageTypeModal open={open} onOpenChange={onOpenChange} editItem={editItem} onSave={handleSave} />;
};

const StageTypeManagement: React.FC = () => {
  const config: EntityManagementConfig<
    StageType,
    StageTypesResponse,
    StageTypeCreateRequest,
    StageTypeUpdateRequest,
    BaseQueryParams
  > = {
    entityName: "Stage Type",
    entityNamePlural: "Stage Types",
    queryKey: "stage-types",

    service: {
      get: stageTypeService.getStageTypes.bind(stageTypeService),
      create: stageTypeService.createStageType.bind(stageTypeService),
      update: stageTypeService.updateStageType.bind(stageTypeService),
      delete: stageTypeService.deleteStageType.bind(stageTypeService),
    },

    displayFields: [
      {
        key: "name",
        label: "Name",
        className: "font-medium truncate",
      },
      {
        key: "display_name",
        label: "Display Name",
        className: "truncate",
      },
      {
        key: "responsible_authority",
        label: "Responsible Authority",
        render: (value: any) => value?.name || "N/A",
        className: "truncate text-sm text-gray-600",
      },
    ],

    searchPlaceholder: "Search stage types...",
    gridColumns: 3,

    ModalComponent: StageTypeModalAdapter,
  };

  return <EntityManagement config={config} />;
};

export default StageTypeManagement;
