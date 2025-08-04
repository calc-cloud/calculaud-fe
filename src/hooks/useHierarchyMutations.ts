import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import { hierarchyService } from "@/services/hierarchyService";
import { HierarchyCreateRequest, HierarchyUpdateRequest, Hierarchy } from "@/types/hierarchies";

export const useCreateHierarchy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: HierarchyCreateRequest) => hierarchyService.createHierarchy(data),
    onSuccess: (newHierarchy: Hierarchy) => {
      // Invalidate and refetch hierarchies
      queryClient.invalidateQueries({ queryKey: ["hierarchies"] });
      toast({
        title: "Hierarchy created",
        description: `${newHierarchy.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
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
      queryClient.invalidateQueries({ queryKey: ["hierarchies"] });
      toast({
        title: "Hierarchy updated",
        description: `${updatedHierarchy.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
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
      queryClient.invalidateQueries({ queryKey: ["hierarchies"] });
      toast({
        title: "Hierarchy deleted",
        description: "The hierarchy has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete hierarchy",
        description: error.message || "An error occurred while deleting the hierarchy.",
        variant: "destructive",
      });
    },
  });
};
