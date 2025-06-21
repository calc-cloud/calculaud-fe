
import { useQuery } from '@tanstack/react-query';
import { serviceTypeService } from '@/services/serviceTypeService';

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ['service-types'],
    queryFn: async () => {
      console.log('useServiceTypes: Fetching service types from backend');
      try {
        const data = await serviceTypeService.getServiceTypes();
        console.log('useServiceTypes success:', data);
        return data;
      } catch (error) {
        console.error('useServiceTypes error:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
