import { apiService } from './apiService';

export interface BaseEntity {
  id: number;
}

export interface BaseListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export abstract class BaseService<
  TEntity extends BaseEntity,
  TListResponse extends BaseListResponse<TEntity>,
  TCreateRequest = Partial<Omit<TEntity, 'id'>>,
  TUpdateRequest = Partial<Omit<TEntity, 'id'>>,
  TQueryParams extends BaseQueryParams = BaseQueryParams
> {
  protected abstract endpoint: string;

  async getEntities(params?: TQueryParams): Promise<TListResponse> {
    return apiService.get<TListResponse>(this.endpoint, params);
  }

  async createEntity(data: TCreateRequest): Promise<TEntity> {
    return apiService.post<TEntity>(this.endpoint, data);
  }

  async updateEntity(id: number, data: TUpdateRequest): Promise<TEntity> {
    return apiService.patch<TEntity>(`${this.endpoint}${id}`, data);
  }

  async deleteEntity(id: number): Promise<void> {
    return apiService.delete<void>(`${this.endpoint}${id}`);
  }
}

export abstract class BaseReadOnlyService<
  TEntity extends BaseEntity,
  TListResponse extends BaseListResponse<TEntity>,
  TQueryParams extends BaseQueryParams = BaseQueryParams
> {
  protected abstract endpoint: string;

  async getEntities(params?: TQueryParams): Promise<TListResponse> {
    return apiService.get<TListResponse>(this.endpoint, params);
  }
}