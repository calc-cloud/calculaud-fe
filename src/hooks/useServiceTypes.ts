
import { useQuery } from '@tanstack/react-query';
import { serviceTypeService } from '@/services/serviceTypeService';

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ['service-types'],
    queryFn: () => serviceTypeService.getServiceTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
