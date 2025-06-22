
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purposeService } from '@/services/purposeService';
import { Purpose } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const usePurposeMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPurpose = useMutation({
    mutationFn: (purposeData: any) => {
      const apiRequest = purposeService.mapPurposeToCreateRequest(purposeData);
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
      toast({
        title: "Error creating purpose",
        description: error.message || "Failed to create purpose",
        variant: "destructive"
      });
    }
  });

  const updatePurpose = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      const apiRequest = purposeService.mapPurposeToUpdateRequest(data);
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
      toast({
        title: "Error updating purpose",
        description: error.message || "Failed to update purpose",
        variant: "destructive"
      });
    }
  });

  const deletePurpose = useMutation({
    mutationFn: (id: string) => {
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
