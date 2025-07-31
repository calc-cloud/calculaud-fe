
import { BaseEntity, PaginatedResponse, BaseCreateRequest, BaseUpdateRequest } from './base';

export type Supplier = BaseEntity;

export type SupplierCreateRequest = BaseCreateRequest;

export type SupplierUpdateRequest = BaseUpdateRequest;

export type SuppliersResponse = PaginatedResponse<Supplier>;


