// Core entity types for the Procurement Management System

export interface Purpose {
  id: string;
  description: string;
  contents: PurposeContent[]; // Changed from content: string to contents: PurposeContent[]
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

// New interface for purpose contents
export interface PurposeContent {
  id?: number; // Present in response, not in request
  material_id: number; // Frontend name, maps to backend service_id
  material_name?: string; // Frontend name, maps to backend service_name
  material_type?: string; // Frontend name, maps to backend service_type
  // Backend API fields (for compatibility)
  service_id?: number; // Backend field name
  service_name?: string; // Backend field name
  service_type?: string; // Backend field name
  quantity: number;
}

export interface EMF {
  id: string;
  purpose_id: string;
  creation_date: string; // Changed from creation_time to creation_date
  demand_id?: string;
  demand_creation_date?: string;
  order_id?: string;
  order_creation_date?: string;
  bikushit_id?: string;
  bikushit_creation_date?: string;
  costs: EMFCost[];
}

export interface EMFCost {
  id: string;
  emf_id: string;
  amount: number;
  currency: Currency;
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

export type PurposeStatus = 'IN_PROGRESS' | 'COMPLETED';

export type Currency = 'SUPPORT_USD' | 'AVAILABLE_USD' | 'ILS';

export type ServiceType = 'Consulting' | 'Software' | 'Hardware' | 'Maintenance' | 'Training' | 'Other';

export type Supplier = 'TechCorp Solutions' | 'Hardware Plus Inc' | 'Strategic Advisors LLC' | 'Global Tech Services' | 'Innovation Partners' | 'Digital Solutions Co' | 'Enterprise Systems Ltd' | 'CloudTech Inc';

// Filter and search types have been moved to @/types/filters



// Modal modes


// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Add specific API response type for purposes
export interface PurposesApiResponse {
  items: Purpose[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
