
export interface DashboardFilters {
  start_date?: string;
  end_date?: string;
  service_ids?: number[];
  service_type_ids?: number[];
  hierarchy_ids?: number[];
  status?: string[];
  supplier_ids?: number[];
}

export interface ServiceItem {
  id: number;
  name: string;
  service_type_id: number;
  service_type_name: string;
  quantity: number;
}

export interface ServicesQuantityResponse {
  data: ServiceItem[];
}

export interface ServiceTypeItem {
  id: number;
  name: string;
  count: number;
}

export interface ServiceTypesDistributionResponse {
  data: ServiceTypeItem[];
}
