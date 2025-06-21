
import { useQuery } from '@tanstack/react-query';
import { supplierService } from '@/services/supplierService';

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => {
      console.log('useSuppliers: Fetching suppliers from backend');
      return supplierService.getSuppliers();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: (error: any) => {
      console.error('useSuppliers error:', error);
    },
    onSuccess: (data: any) => {
      console.log('useSuppliers success:', data);
    }
  });
};
