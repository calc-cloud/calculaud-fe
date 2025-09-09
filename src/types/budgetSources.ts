import { BaseEntity, PaginatedResponse, BaseCreateRequest, BaseUpdateRequest } from "./base";

export type BudgetSource = BaseEntity;

export type BudgetSourceCreateRequest = BaseCreateRequest;

export type BudgetSourceUpdateRequest = BaseUpdateRequest;

export type BudgetSourcesResponse = PaginatedResponse<BudgetSource>;