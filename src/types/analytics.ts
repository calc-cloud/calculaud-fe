
export interface DashboardFilters {
  start_date?: string;
  end_date?: string;
  service_ids?: number[];
  service_type_ids?: number[];
  hierarchy_ids?: number[];
  status?: string[];
  supplier_ids?: number[];
}

export interface ServicesQuantityResponse {
  labels: string[];
  data: number[];
}

export interface ServiceTypesDistributionResponse {
  labels: string[];
  data: number[];
}
