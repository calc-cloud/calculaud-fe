
import { hierarchyService } from '@/services/hierarchyService';
import { HierarchyFilters } from '@/types/hierarchies';

import { useEntityData } from './useEntityData';

export const useHierarchies = (filters?: HierarchyFilters) => {
  return useEntityData(
    'hierarchies',
    hierarchyService.getHierarchies.bind(hierarchyService),
    filters,
    {
      staleTime: 0 // Use default React Query staleTime (0)
    }
  );
};
