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
  target_status: "SIGNED" | "COMPLETED";
}

export interface BudgetSourceAmounts {
  ils: number;
  support_usd: number;
  available_usd: number;
  total_usd: number;
  total_ils: number;
}

export interface BudgetSourceDistributionItem {
  budget_source_id: number | null;
  budget_source_name: string;
  amounts: BudgetSourceAmounts;
}

export interface BudgetSourceDistributionResponse {
  data: BudgetSourceDistributionItem[];
}

export interface ServiceTypeCostsDistributionItem {
  service_type_id: number;
  service_type_name: string;
  amounts: BudgetSourceAmounts;
}

export interface ServiceTypeCostsDistributionResponse {
  data: ServiceTypeCostsDistributionItem[];
}

export interface ProcessingTimeServiceType {
  service_type_id: number;
  service_type_name: string;
  count: number;
  average_processing_days: number;
  min_processing_days: number;
  max_processing_days: number;
}

export interface ProcessingTimesResponse {
  service_types: ProcessingTimeServiceType[];
  total_purposes: number;
}

export interface StageProcessingTimeServiceType {
  service_type_id: number;
  service_type_name: string;
  count: number;
  avg_processing_days: number;
  min_processing_days: number;
  max_processing_days: number;
}

export interface StageProcessingTimeData {
  stage_type_id: number;
  stage_type_name: string;
  stage_type_display_name: string;
  service_types: StageProcessingTimeServiceType[];
  overall_count: number;
  overall_avg_processing_days: number;
  overall_min_processing_days: number;
  overall_max_processing_days: number;
}

export interface StageProcessingTimesResponse {
  data: StageProcessingTimeData[];
}
