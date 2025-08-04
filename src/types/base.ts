// Base entity interfaces to reduce duplication across entity types

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  id: number;
  name: string;
}

/**
 * Entity with timestamp fields
 */
export interface TimestampedEntity extends BaseEntity {
  created_at: string;
  updated_at: string;
}

/**
 * Entity with single timestamp (like ResponsibleAuthority)
 */
export interface CreatedEntity extends BaseEntity {
  created_at: string;
}

/**
 * Generic paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Base request interface for creating entities with just name
 */
export interface BaseCreateRequest {
  name: string;
}

/**
 * Base request interface for updating entities with just name
 */
export interface BaseUpdateRequest {
  name?: string;
}

/**
 * Base pagination parameters
 */
export interface BasePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Generic type utility for creating entity-specific CRUD request types
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EntityCreateRequest<T = {}> = BaseCreateRequest & T;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EntityUpdateRequest<T = {}> = BaseUpdateRequest & T;
