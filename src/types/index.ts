// Core entity types for the Procurement Management System

// Export base types for reuse
export * from "./base";

// Currency enum with API values
export enum Currency {
  ILS = "ILS",
  SUPPORT_USD = "SUPPORT_USD",
  AVAILABLE_USD = "AVAILABLE_USD",
}

// Helper to get display name for currency
export const getCurrencyDisplayName = (currency: Currency): string => {
  switch (currency) {
    case Currency.ILS:
      return "ILS";
    case Currency.SUPPORT_USD:
      return "USD Support";
    case Currency.AVAILABLE_USD:
      return "USD Available";
    default:
      return currency;
  }
};

// Helper to get currency symbol
export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case Currency.ILS:
      return "₪";
    case Currency.SUPPORT_USD:
    case Currency.AVAILABLE_USD:
      return "$";
    default:
      return "";
  }
};

// Authority interface - used across multiple entities
export interface Authority {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

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
  service_type: string;
  creation_time: string;
  last_modified: string;
  purchases: Purchase[]; // Changed from emfs: EMF[] to purchases: Purchase[]
  files: PurposeFile[];
  pending_authority?: Authority;
  is_flagged: boolean;
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
  id: number;
  purpose_id: string;
  creation_date: string;
  costs: Cost[];
  flow_stages: Stage[];
  current_pending_stages?: Stage[];
  days_since_last_completion?: number;
  pending_authority?: Authority;
}

export interface Stage {
  id: string;
  purchase_id: string;
  stage_type_id: string;
  priority: number;
  value: string | null;
  completion_date: string | null;
  days_since_previous_stage: number | null;
  stage_type: StageType;
}

export interface StageType {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  value_required: boolean;
  responsible_authority_id?: number;
  responsible_authority?: Authority;
  created_at?: string;
}

export interface Cost {
  id: string;
  purchase_id: string; // Changed from emf_id to purchase_id
  amount: number;
  currency: Currency; // Now uses Currency enum
}

// Request interface for creating a new purchase
export interface CreatePurchaseRequest {
  purpose_id: number;
  costs: CreateCostRequest[];
}

export interface CreateCostRequest {
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

export type PurposeStatus = "IN_PROGRESS" | "COMPLETED" | "SIGNED" | "PARTIALLY_SUPPLIED";

// Add specific API response type for purposes
export interface PurposesApiResponse {
  items: Purpose[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
