
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

export interface HierarchyDistributionItem {
  id: number;
  name: string;
  path: string;
  type: 'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM';
  count: number;
  parent_id: number | null;
}

export interface HierarchyDistributionResponse {
  items: HierarchyDistributionItem[];
  level: 'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM';
  parent_name: string | null;
}

export interface ExpenditureTimelineServiceType {
  service_type_id: number;
  name: string;
  total_ils: number;
  total_usd: number;
}

export interface ExpenditureTimelineItem {
  time_period: string;
  total_ils: number;
  total_usd: number;
  data: ExpenditureTimelineServiceType[];
}

export interface ExpenditureTimelineResponse {
  items: ExpenditureTimelineItem[];
  group_by: 'day' | 'week' | 'month' | 'year';
}
