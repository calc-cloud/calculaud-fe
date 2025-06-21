
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purposeService } from '@/services/purposeService';
import { useAdminData } from '@/contexts/AdminDataContext';
import { Purpose } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const usePurposeMutations = () => {
  const queryClient = useQueryClient();
  const { hierarchies, suppliers, serviceTypes } = useAdminData();
  const { toast } = useToast();

  const createPurpose = useMutation({
    mutationFn: (purposeData: Partial<Purpose>) => {
      console.log('Creating purpose with data:', purposeData);
      console.log('Available hierarchies:', hierarchies);
      console.log('Available suppliers:', suppliers);
      console.log('Available serviceTypes:', serviceTypes);
      
      const apiRequest = purposeService.mapPurposeToCreateRequest(
        purposeData,
        hierarchies,
        suppliers,
        serviceTypes
      );
      console.log('Mapped API request:', apiRequest);
      return purposeService.createPurpose(apiRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purposes'] });
      toast({
        title: "Purpose created",
        description: "The purpose has been successfully created.",
      });
    },
    onError: (error: any) => {
      console.error('Create purpose error:', error);
      toast({
        title: "Error creating purpose",
        description: error.message || "Failed to create purpose",
        variant: "destructive"
      });
    }
  });

  const updatePurpose = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Purpose> }) => {
      console.log('Updating purpose with id:', id, 'data:', data);
      const apiRequest = purposeService.mapPurposeToUpdateRequest(
        data,
        hierarchies,
        suppliers,
        serviceTypes
      );
      console.log('Mapped update API request:', apiRequest);
      return purposeService.updatePurpose(id, apiRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purposes'] });
      toast({
        title: "Purpose updated",
        description: "The purpose has been successfully updated.",
      });
    },
    onError: (error: any) => {
      console.error('Update purpose error:', error);
      toast({
        title: "Error updating purpose",
        description: error.message || "Failed to update purpose",
        variant: "destructive"
      });
    }
  });

  const deletePurpose = useMutation({
    mutationFn: (id: string) => {
      console.log('Deleting purpose with id:', id);
      return purposeService.deletePurpose(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purposes'] });
      toast({
        title: "Purpose deleted",
        description: "The purpose has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      console.error('Delete purpose error:', error);
      toast({
        title: "Error deleting purpose",
        description: error.message || "Failed to delete purpose",
        variant: "destructive"
      });
    }
  });

  return {
    createPurpose,
    updatePurpose,
    deletePurpose
  };
};
