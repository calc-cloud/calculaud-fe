import { BaseQueryParams } from "@/services/BaseService";
import { supplierService } from "@/services/supplierService";
import { Supplier, SuppliersResponse, SupplierCreateRequest, SupplierUpdateRequest } from "@/types/suppliers";

import { EntityManagement, EntityManagementConfig } from "./EntityManagement";
import SupplierModal from "./SupplierModal";

const SupplierManagement: React.FC = () => {
  const config: EntityManagementConfig<
    Supplier,
    SuppliersResponse,
    SupplierCreateRequest,
    SupplierUpdateRequest,
    BaseQueryParams
  > = {
    entityName: "Supplier",
    entityNamePlural: "Suppliers",
    queryKey: "suppliers",

    service: {
      get: supplierService.getSuppliers.bind(supplierService),
      create: supplierService.createSupplier.bind(supplierService),
      update: supplierService.updateSupplier.bind(supplierService),
      delete: supplierService.deleteSupplier.bind(supplierService),
    },

    displayFields: [
      {
        key: "name",
        label: "Name",
        className: "font-medium truncate",
      },
    ],

    searchPlaceholder: "Search suppliers...",
    gridColumns: 3,

    ModalComponent: SupplierModal,
  };

  return <EntityManagement config={config} />;
};

export default SupplierManagement;
