


export type SortField = 'creation_time' | 'expected_delivery' | 'last_modified';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Helper function to get display name for sort fields
export const getSortFieldDisplayName = (field: SortField): string => {
  switch (field) {
    case 'creation_time':
      return 'Created At';
    case 'expected_delivery':
      return 'Expected Delivery';
    case 'last_modified':
      return 'Last Modified';
    default:
      return field;
  }
};


