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
  purchases: Purchase[]; // Changed from emfs: EMF[] to purchases: Purchase[]
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

// New Purchase workflow types
export interface Purchase {
  id: string;
  purpose_id: string;
  creation_date: string;
  costs: Cost[];
  flow_stages: Stage[];
}

export interface Stage {
  id: string;
  purchase_id: string;
  stage_type_id: string;
  priority: number;
  value: string | null;
  completion_date: string | null;
  stage_type: StageType;
}

export interface StageType {
  id: string;
  name: string;
  value_required: boolean;
}

export interface Cost {
  id: string;
  purchase_id: string; // Changed from emf_id to purchase_id
  amount: number;
  currency: Currency;
  cost_type: CostType;
}

export type CostType = 'SUPPORT' | 'AVAILABLE';



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
