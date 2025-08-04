import React from "react";

import { hierarchyService } from "@/services/hierarchyService";
import {
  Hierarchy,
  HierarchiesResponse,
  HierarchyCreateRequest,
  HierarchyUpdateRequest,
  HierarchyFilters,
} from "@/types/hierarchies";

import { CreateHierarchyModal } from "./CreateHierarchyModal";
import { EntityManagement, EntityManagementConfig } from "./EntityManagement";

// Adapter component to bridge CreateHierarchyModal interface with EntityManagement
const HierarchyModalAdapter: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: Hierarchy | null;
  onSave: (data: HierarchyCreateRequest | HierarchyUpdateRequest, editId?: number) => Promise<void>;
}> = ({ open, onOpenChange, editItem, onSave }) => {
  return <CreateHierarchyModal open={open} onOpenChange={onOpenChange} editItem={editItem} onSave={onSave} />;
};

const formatTypeDisplay = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const HierarchyManagement: React.FC = () => {
  const config: EntityManagementConfig<
    Hierarchy,
    HierarchiesResponse,
    HierarchyCreateRequest,
    HierarchyUpdateRequest,
    HierarchyFilters
  > = {
    entityName: "Hierarchy",
    entityNamePlural: "Hierarchies",
    queryKey: "hierarchies",

    service: {
      get: hierarchyService.getHierarchies.bind(hierarchyService),
      create: hierarchyService.createHierarchy.bind(hierarchyService),
      update: hierarchyService.updateHierarchy.bind(hierarchyService),
      delete: hierarchyService.deleteHierarchy.bind(hierarchyService),
    },

    displayFields: [
      {
        key: "path",
        label: "Path",
        className: "font-medium truncate",
      },
      {
        key: "type",
        label: "Type",
        render: (value: string) => `Type: ${formatTypeDisplay(value)}`,
        className: "text-xs text-gray-500 mt-1",
      },
    ],

    searchPlaceholder: "Search hierarchies...",
    gridColumns: 3,

    buildQueryParams: (page: number, limit: number, search?: string) =>
      ({
        page,
        limit,
        search,
        sort_by: "name",
        sort_order: "asc",
      }) as HierarchyFilters,

    ModalComponent: HierarchyModalAdapter,
  };

  return <EntityManagement config={config} />;
};

export default HierarchyManagement;
