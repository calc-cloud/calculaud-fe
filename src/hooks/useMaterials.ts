import { useQuery } from '@tanstack/react-query';
import { materialService } from '@/services/materialService';

export const useMaterials = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  service_type_id?: number;
}) => {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: async () => {
      try {
        const data = await materialService.getMaterials(params);
        return data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: params?.service_type_id ? params.service_type_id > 0 : true,
  });
};
