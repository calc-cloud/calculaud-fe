
import { Purpose } from '@/types';

export type SortField = 'creation_time' | 'expected_delivery' | 'last_modified';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}


