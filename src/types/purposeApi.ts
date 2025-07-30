import { Currency } from '@/types';

export interface PurposeApiParams {
  page?: number;
  limit?: number; // Changed from size to limit
  hierarchy_id?: number | number[];
  supplier_id?: number | number[];
  service_type_id?: number | number[];
  service_id?: number | number[]; // Material filter (maps to service_id in API)
  pending_authority_id?: number | number[];
  status?: string | string[];
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  start_date?: string;
  end_date?: string;
}

export interface PurposeApiResponse {
  items: Purpose[];
  total: number;
  page: number;
  limit: number; // Changed from size to limit
  pages: number;
}

export interface APIContent {
  service_id: number;
  service_name: string;
  service_type: string;
  quantity: number;
}

export interface Purpose {
  id: number;
  hierarchy?: {
    type: string;
    name: string;
    parent_id: number | null;
    id: number;
    path: string;
  };
  expected_delivery: string;
  comments?: string;
  status: string;
  supplier: string;
  contents: APIContent[]; // Changed from content to contents
  description: string;
  service_type: string;
  creation_time: string;
  last_modified: string;
  purchases: Purchase[]; // Changed from emfs: EMF[] to purchases: Purchase[]
  file_attachments: {
    id: number;
    original_filename: string;
    mime_type: string;
    file_size: number;
    s3_key: string;
    uploaded_at: string;
    file_url: string;
  }[];
  pending_authority?: {
    id: number;
    name: string;
    description: string;
    created_at: string;
  };
}

export interface Purchase {
  id: number;
  purpose_id: number;
  creation_date: string;
  costs: Cost[];
  flow_stages: Stage[];
  current_pending_stages?: Stage[];
  days_since_last_completion?: number;
}

export interface Stage {
  id: number;
  purchase_id: number;
  stage_type_id: number;
  priority: number;
  value: string | null;
  completion_date: string | null;
  days_since_previous_stage: number | null;
  stage_type: StageType;
}

export interface StageType {
  id: number;
  name: string;
  display_name?: string;
  value_required: boolean;
}

export interface Cost {
  id: number;
  purchase_id: number; // Changed from emf_id to purchase_id
  currency: Currency;
  amount: number;
}

// Request interfaces for create/update
export interface CreatePurposeRequest {
  hierarchy_id?: number;
  expected_delivery?: string;
  comments?: string;
  status: string;
  supplier_id: number;
  contents: CreateContentRequest[]; // Changed from content to contents
  description: string;
  service_type_id: number;
  purchases?: CreatePurchaseRequest[]; // Changed from emfs?: CreateEMFRequest[] to purchases?: CreatePurchaseRequest[]
}

export interface CreateContentRequest {
  service_id: number;
  quantity: number;
}

export interface CreatePurchaseRequest {
  creation_date?: string;
  costs: CreateCostRequest[];
  flow_stages?: CreateStageRequest[];
}

export interface CreateStageRequest {
  stage_type_id: number;
  priority: number;
  value?: string;
  completion_date?: string;
}

export interface CreateCostRequest {
  currency: Currency;
  amount: number;
}

export interface UpdatePurposeRequest {
  hierarchy_id?: number;
  expected_delivery?: string;
  comments?: string;
  status?: string;
  supplier_id?: number;
  contents?: CreateContentRequest[]; // Changed from content to contents
  description?: string;
  service_type_id?: number;
  purchases?: CreatePurchaseRequest[]; // Changed from emfs?: CreateEMFRequest[] to purchases?: CreatePurchaseRequest[]
}