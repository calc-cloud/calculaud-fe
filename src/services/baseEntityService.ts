import { BaseEntity, BaseCreateRequest, BaseUpdateRequest, BaseResponse, BaseFilters } from '@/types/base';

import { apiService } from './apiService';

export abstract class BaseEntityService<
  TEntity extends BaseEntity,
  TCreateRequest extends BaseCreateRequest,
  TUpdateRequest extends BaseUpdateRequest,
  TFilters extends BaseFilters = BaseFilters
> {
  protected readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(params?: TFilters): Promise<BaseResponse<TEntity>> {
    return apiService.get<BaseResponse<TEntity>>(this.endpoint, params);
  }

  async getById(id: number): Promise<TEntity> {
    return apiService.get<TEntity>(`${this.endpoint}${id}`);
  }

  async create(data: TCreateRequest): Promise<TEntity> {
    return apiService.post<TEntity>(this.endpoint, data);
  }

  async update(id: number, data: TUpdateRequest): Promise<TEntity> {
    return apiService.patch<TEntity>(`${this.endpoint}${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`${this.endpoint}${id}`);
  }
}