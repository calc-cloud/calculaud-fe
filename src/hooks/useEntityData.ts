import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { BaseEntity, BaseQueryParams } from '@/services/BaseService';
import { PaginatedResponse } from '@/types/base';

export interface UseEntityDataOptions<TParams extends BaseQueryParams, TResponse = any> {
  enabled?: boolean | ((params?: TParams) => boolean);
  staleTime?: number;
  select?: (data: TResponse) => any;
}

export function useEntityData<
  TEntity extends BaseEntity,
  TResponse extends PaginatedResponse<TEntity>,
  TParams extends BaseQueryParams = BaseQueryParams
>(
  queryKey: string,
  queryFn: (params?: TParams) => Promise<TResponse>,
  params?: TParams,
  options: UseEntityDataOptions<TParams, TResponse> = {}
) {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000, // 10 minutes default
    select
  } = options;

  const enabledValue = typeof enabled === 'function' ? enabled(params) : enabled;

  return useQuery({
    queryKey: [queryKey, params],
    queryFn: () => queryFn(params),
    staleTime,
    enabled: enabledValue,
    select,
  } as UseQueryOptions<TResponse, Error, any, (string | TParams | undefined)[]>);
}

// Specialized hook for entity lists that returns items directly
export function useEntityList<
  TEntity extends BaseEntity,
  TResponse extends PaginatedResponse<TEntity>,
  TParams extends BaseQueryParams = BaseQueryParams
>(
  queryKey: string,
  queryFn: (params?: TParams) => Promise<TResponse>,
  params?: TParams,
  options: Omit<UseEntityDataOptions<TParams, TResponse>, 'select'> = {}
) {
  return useEntityData(
    queryKey,
    queryFn,
    params,
    {
      ...options,
      select: (data: TResponse) => ({
        ...data,
        items: data.items || []
      })
    }
  );
}

// Specialized hook for simple item arrays (like ResponsibleAuthorities)
export function useEntityItems<
  TEntity extends BaseEntity,
  TResponse extends PaginatedResponse<TEntity>,
  TParams extends BaseQueryParams = BaseQueryParams
>(
  queryKey: string,
  queryFn: (params?: TParams) => Promise<TResponse>,
  params?: TParams,
  options: Omit<UseEntityDataOptions<TParams, TResponse>, 'select'> = {}
) {
  const query = useEntityData(
    queryKey,
    queryFn,
    params,
    {
      ...options,
      select: (data: TResponse) => data.items || []
    }
  );

  return {
    data: query.data || [] as TEntity[],
    isLoading: query.isLoading,
    error: query.error,
    ...query
  };
}