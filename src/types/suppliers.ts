
import { BaseEntity, BaseResponse, BaseCreateRequest, BaseUpdateRequest, BaseFilters } from './base';

export type Supplier = BaseEntity;

export type SupplierCreateRequest = BaseCreateRequest;

export type SupplierUpdateRequest = BaseUpdateRequest;

export type SuppliersResponse = BaseResponse<Supplier>;

export type SupplierFilters = BaseFilters;
