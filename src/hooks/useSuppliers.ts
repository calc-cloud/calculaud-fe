import { BaseQueryParams } from "@/services/BaseService";
import { supplierService } from "@/services/supplierService";

import { useEntityData } from "./useEntityData";

export const useSuppliers = (params?: BaseQueryParams) => {
  return useEntityData("suppliers", supplierService.getSuppliers.bind(supplierService), params);
};
