
import { useQuery } from '@tanstack/react-query';
import { hierarchyService } from '@/services/hierarchyService';
import { HierarchyFilters } from '@/types/hierarchies';

export const useHierarchies = (filters?: HierarchyFilters) => {
  return useQuery({
    queryKey: ['hierarchies', filters],
    queryFn: () => hierarchyService.getHierarchies(filters),
  });
};
