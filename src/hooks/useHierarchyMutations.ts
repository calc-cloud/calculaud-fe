
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hierarchyService } from '@/services/hierarchyService';
import { HierarchyCreateRequest, HierarchyUpdateRequest, Hierarchy } from '@/types/hierarchies';
import { useToast } from '@/hooks/use-toast';

export const useCreateHierarchy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: HierarchyCreateRequest) => hierarchyService.createHierarchy(data),
    onSuccess: (newHierarchy: Hierarchy) => {
      // Invalidate and refetch hierarchies
      queryClient.invalidateQueries({ queryKey: ['hierarchies'] });
      toast({
        title: "Hierarchy created",
        description: `${newHierarchy.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Create hierarchy error:', error);
      toast({
        title: "Failed to create hierarchy",
        description: error.message || "An error occurred while creating the hierarchy.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateHierarchy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HierarchyUpdateRequest }) => 
      hierarchyService.updateHierarchy(id, data),
    onSuccess: (updatedHierarchy: Hierarchy) => {
      // Invalidate and refetch hierarchies
      queryClient.invalidateQueries({ queryKey: ['hierarchies'] });
      toast({
        title: "Hierarchy updated",
        description: `${updatedHierarchy.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('Update hierarchy error:', error);
      toast({
        title: "Failed to update hierarchy",
        description: error.message || "An error occurred while updating the hierarchy.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteHierarchy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => hierarchyService.deleteHierarchy(id),
    onSuccess: () => {
      // Invalidate and refetch hierarchies
      queryClient.invalidateQueries({ queryKey: ['hierarchies'] });
      toast({
        title: "Hierarchy deleted",
        description: "The hierarchy has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Delete hierarchy error:', error);
      
      // Check if it's a 400 error (likely due to children)
      const isChildrenError = error?.response?.status === 400 || 
                             error?.status === 400 ||
                             error?.message?.toLowerCase().includes('children') ||
                             error?.message?.toLowerCase().includes('child');
      
      if (isChildrenError) {
        toast({
          title: "Cannot delete hierarchy",
          description: "This hierarchy cannot be deleted because it has child hierarchies. Please delete all child hierarchies first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to delete hierarchy",
          description: error.message || "An error occurred while deleting the hierarchy.",
          variant: "destructive",
        });
      }
    },
  });
};
