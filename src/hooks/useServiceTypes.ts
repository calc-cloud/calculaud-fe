
import { useQuery } from '@tanstack/react-query';

import { serviceTypeService } from '@/services/serviceTypeService';

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ['service-types'],
    queryFn: async () => {
      const data = await serviceTypeService.getServiceTypes();
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
