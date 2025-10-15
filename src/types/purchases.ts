import { BaseEntity, PaginatedResponse } from "./base";
import { BudgetSource } from "./budgetSources";
import { StageType } from "./stageTypes";

export interface Purchase extends BaseEntity {
  purpose_id: string;
  creation_date: string;
  budget_source_id?: number;
  budget_source?: BudgetSource;
  costs: Cost[];
  flow_stages: Stage[];
  current_pending_stages?: Stage[];
  days_since_last_completion?: number;
  pending_authority?: Authority;
}

export interface Cost {
  id: string;
  purchase_id: string;
  amount: number;
  currency: string;
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

// Shared interface for frontend components that need to handle both existing and new stages
export interface StageData {
  id: number;
  stage_type_id: number;
  priority: number;
  stage_type: StageType;
  purchase_id: number;
  isNew?: boolean;
  tempId?: number;

  // Optional - not used in timeline editing, only for compatibility with Stage
  value?: string | boolean | null;
  completion_date?: string | null;
  days_since_previous_stage?: number | null;
}

export interface Authority {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface PurchaseCreateRequest {
  purpose_id: number;
  budget_source_id: number;
  costs: CreateCostRequest[];
}

export interface CreateCostRequest {
  amount: number;
  currency: string;
}

export interface StageUpdateItem {
  id?: number;
  stage_type_id?: number;
}

export interface PurchaseUpdateRequest {
  budget_source_id?: number;
  stages?: Array<StageUpdateItem | StageUpdateItem[]>;
}

export type PurchasesResponse = PaginatedResponse<Purchase>;
