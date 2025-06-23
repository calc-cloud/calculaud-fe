
import { useQuery } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';

export const useServices = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  service_type_id?: number;
}) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      try {
        const data = await serviceService.getServices(params);
        return data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: params?.service_type_id ? params.service_type_id > 0 : true,
  });
};
