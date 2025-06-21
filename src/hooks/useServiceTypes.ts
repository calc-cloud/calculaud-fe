
import { useQuery } from '@tanstack/react-query';
import { serviceTypeService } from '@/services/serviceTypeService';

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ['service-types'],
    queryFn: () => {
      console.log('useServiceTypes: Fetching service types from backend');
      return serviceTypeService.getServiceTypes();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: (error: any) => {
      console.error('useServiceTypes error:', error);
    },
    onSuccess: (data: any) => {
      console.log('useServiceTypes success:', data);
    }
  });
};
