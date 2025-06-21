
// Core entity types for the Procurement Management System

export interface Purpose {
  id: string;
  description: string;
  content: string;
  supplier: string;
  hierarchy_id: string;
  hierarchy_name: string;
  status: PurposeStatus;
  expected_delivery: string;
  comments?: string;
  service_type: ServiceType;
  creation_time: string;
  last_modified: string;
  emfs: EMF[];
  files: PurposeFile[];
}

export interface EMF {
  id: string;
  purpose_id: string;
  creation_date: string;
  demand_id?: string;
  demand_date?: string;
  order_id?: string;
  order_date?: string;
  bikushit_id?: string;
  bikushit_date?: string;
  costs: EMFCost[];
}

export interface EMFCost {
  id: string;
  emf_id: string;
  amount: number;
  currency: string;
}

export interface PurposeFile {
  id: string;
  purpose_id: string;
  filename: string;
  file_url: string;
  upload_date: string;
  file_size: number;
}

export interface Hierarchy {
  id: string;
  name: string;
}

export type PurposeStatus = 'Pending' | 'In Progress' | 'Rejected' | 'Completed';

export type ServiceType = 'Consulting' | 'Software' | 'Hardware' | 'Maintenance' | 'Training' | 'Other';

export type Supplier = 'TechCorp Solutions' | 'Hardware Plus Inc' | 'Strategic Advisors LLC' | 'Global Tech Services' | 'Innovation Partners' | 'Digital Solutions Co' | 'Enterprise Systems Ltd' | 'CloudTech Inc';

// Filter and search types
export interface PurposeFilters {
  hierarchy_id?: string;
  service_type?: ServiceType[];
  supplier?: Supplier[];
  status?: PurposeStatus[];
  search_query?: string;
}

export interface PurposeSorting {
  field: 'creation_time' | 'last_modified' | 'expected_delivery';
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

// Modal modes
export type ModalMode = 'view' | 'create' | 'edit';

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
