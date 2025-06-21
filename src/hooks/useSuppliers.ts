
import { useQuery } from '@tanstack/react-query';
import { supplierService } from '@/services/supplierService';

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      console.log('useSuppliers: Fetching suppliers from backend');
      try {
        const data = await supplierService.getSuppliers();
        console.log('useSuppliers success:', data);
        return data;
      } catch (error) {
        console.error('useSuppliers error:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
