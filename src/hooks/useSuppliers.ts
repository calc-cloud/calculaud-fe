
import { useQuery } from '@tanstack/react-query';

import { supplierService } from '@/services/supplierService';

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const data = await supplierService.getSuppliers();
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
