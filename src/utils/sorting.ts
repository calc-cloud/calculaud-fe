
import { Purpose } from '@/types';

export type SortField = 'creation_time' | 'expected_delivery' | 'last_modified';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export const sortPurposes = (purposesToSort: Purpose[], config: SortConfig): Purpose[] => {
  return [...purposesToSort].sort((a, b) => {
    let aValue: string | Date;
    let bValue: string | Date;

    switch (config.field) {
      case 'creation_time':
        aValue = new Date(a.creation_time);
        bValue = new Date(b.creation_time);
        break;
      case 'expected_delivery':
        aValue = new Date(a.expected_delivery);
        bValue = new Date(b.expected_delivery);
        break;
      case 'last_modified':
        aValue = new Date(a.last_modified);
        bValue = new Date(b.last_modified);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return config.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return config.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

export const getSortDisplayName = (field: SortField): string => {
  switch (field) {
    case 'creation_time':
      return 'Creation Time';
    case 'expected_delivery':
      return 'Expected Delivery';
    case 'last_modified':
      return 'Last Modified';
    default:
      return field;
  }
};
