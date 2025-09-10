export * from "./base";
export * from "./budgetSources";
export * from "./purchases";

import type { Purchase } from "./purchases";

export enum Currency {
  ILS = "ILS",
  SUPPORT_USD = "SUPPORT_USD",
  AVAILABLE_USD = "AVAILABLE_USD",
}

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

export interface Authority {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Purpose {
  id: string;
  description: string;
  contents: PurposeContent[];
  supplier: string;
  hierarchy_id: string;
  hierarchy_name: string;
  status: PurposeStatus;
  expected_delivery: string;
  comments?: string;
  service_type: string;
  creation_time: string;
  last_modified: string;
  purchases: Purchase[];
  files: PurposeFile[];
  pending_authority?: Authority;
  is_flagged: boolean;
}

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

export interface PurposesApiResponse {
  items: Purpose[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
