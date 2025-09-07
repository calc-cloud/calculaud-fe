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

export interface ServiceQuantityItem {
  service_id: number;
  service_name: string;
  quantity: number;
  purposes_count?: number;
}

export interface ServiceTypeQuantityData {
  service_type_id: number;
  service_type_name: string;
  total_quantity: number;
  services: ServiceQuantityItem[];
}

export interface ServiceQuantitiesResponse {
  data: ServiceTypeQuantityData[];
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

export interface ServiceTypeCount {
  service_type_id: number;
  service_type_name: string;
  count: number;
}

export interface PendingStagesDistributionItem {
  stage_type_id: number;
  stage_type_name: string;
  total_count: number;
  service_types: ServiceTypeCount[];
}

export interface PendingStagesDistributionResponse {
  data: PendingStagesDistributionItem[];
}

export interface ServiceTypePerformanceItem {
  service_type_id: number;
  service_type_name: string;
  count: number;
}

export interface ServiceTypesPerformanceDistributionResponse {
  data: ServiceTypePerformanceItem[];
  total_count: number;
  target_status: 'SIGNED' | 'COMPLETED';
}
