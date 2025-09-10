import { BaseEntity, PaginatedResponse } from "./base";
import { BudgetSource } from "./budgetSources";

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
  id: string;
  purchase_id: string;
  stage_type_id: number;
  priority: number;
  value: string | null;
  completed: boolean;
  date: string | null;
  stage_type: StageType;
  days_since_previous_stage?: number;
}

export interface StageType {
  id: number;
  name: string;
  value_required: boolean;
  responsible_authority?: Authority;
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

export interface PurchaseUpdateRequest {
  budget_source_id: number;
}

export type PurchasesResponse = PaginatedResponse<Purchase>;
