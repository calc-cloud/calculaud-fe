
import { useQuery } from '@tanstack/react-query';
import { serviceTypeService } from '@/services/serviceTypeService';

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ['service-types'],
    queryFn: async () => {
      try {
        const data = await serviceTypeService.getServiceTypes();
        return data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
