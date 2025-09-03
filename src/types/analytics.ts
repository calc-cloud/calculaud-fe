export interface DashboardFilters {
  start_date?: string;
  end_date?: string;
  relative_time?: string;
  service_id?: number[];
  service_type_id?: number[];
  hierarchy_id?: number[];
  status?: string[];
  supplier_id?: number[];
  pending_authority_id?: number[];
  flagged?: boolean;
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

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface StatusDistributionResponse {
  data: StatusDistributionItem[];
}

export interface PendingAuthorityDistributionItem {
  authority_id: number | null;
  authority_name: string;
  count: number;
}

export interface PendingAuthorityDistributionResponse {
  data: PendingAuthorityDistributionItem[];
}
