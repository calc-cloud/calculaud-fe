
import { useQuery } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        const data = await serviceService.getServices();
        return data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
