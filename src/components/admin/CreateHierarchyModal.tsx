import { Building2, Building, Users, User, UserCheck, Loader2 } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { useHierarchies } from "@/hooks/useHierarchies";
import { useCreateHierarchy, useUpdateHierarchy } from "@/hooks/useHierarchyMutations";
import { Hierarchy, HierarchyType, HierarchyCreateRequest, HierarchyUpdateRequest } from "@/types/hierarchies";

interface CreateHierarchyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Hierarchy | null;
  onSave?: (data: HierarchyCreateRequest | HierarchyUpdateRequest, editId?: number) => Promise<void>;
}

const hierarchyOrder: HierarchyType[] = ["UNIT", "CENTER", "ANAF", "MADOR", "TEAM"];

const getHierarchyIcon = (type: HierarchyType) => {
  switch (type) {
    case "UNIT":
      return Building2;
    case "CENTER":
      return Building;
    case "ANAF":
      return Users;
    case "MADOR":
      return User;
    case "TEAM":
      return UserCheck;
  }
};

const formatTypeDisplay = (type: HierarchyType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

export const CreateHierarchyModal: React.FC<CreateHierarchyModalProps> = ({ open, onOpenChange, editItem, onSave }) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<HierarchyType>("UNIT");
  const [hierarchyName, setHierarchyName] = useState("");
  const [parentType, setParentType] = useState<HierarchyType | "">("");
  const [parentId, setParentId] = useState<number | null>(null);

  const isEditing = !!editItem;

  // Mutation hooks
  const createMutation = useCreateHierarchy();
  const updateMutation = useUpdateHierarchy();

  // Fetch hierarchies for parent selection
  const { data: hierarchiesData } = useHierarchies();
  const hierarchies = useMemo(() => hierarchiesData?.items || [], [hierarchiesData?.items]);

  // Get available parent hierarchies based on selected type
  const availableHierarchies = hierarchies.filter((hierarchy) => {
    // Simple filtering logic - can be enhanced based on business rules
    return hierarchy.type !== selectedType;
  });

  // Get available parent types (only higher levels in hierarchy)
  const getAvailableParentTypes = (): HierarchyType[] => {
    const currentIndex = hierarchyOrder.indexOf(selectedType);
    // Return only types that come before the selected type (higher in hierarchy)
    return hierarchyOrder.slice(0, currentIndex);
  };

  // Get available parent hierarchies based on selected parent type
  const getAvailableParentHierarchies = (): Hierarchy[] => {
    if (!parentType) return [];
    return availableHierarchies.filter((h) => h.type === parentType);
  };

  // Initialize form with edit data when editing
  useEffect(() => {
    if (!open) return; // Don't run when modal is closed

    if (editItem) {
      setSelectedType(editItem.type);
      setHierarchyName(editItem.name);
      // Reset parent info - will be set by the separate effect below
      setParentType("");
      setParentId(null);
    } else {
      // Reset form when creating new
      setSelectedType("UNIT");
      setHierarchyName("");
      setParentType("");
      setParentId(null);
    }
  }, [editItem, open]);

  // Separate effect to set parent data when hierarchies load (for edit mode only)
  useEffect(() => {
    if (editItem && open && editItem.parent_id && hierarchies.length > 0 && !parentType && !parentId) {
      const parent = hierarchies.find((h) => h.id === editItem.parent_id);
      if (parent) {
        setParentType(parent.type);
        setParentId(parent.id);
      }
    }
  }, [hierarchies, editItem, open, parentType, parentId]);

  const handleTypeChange = (type: string) => {
    if (type) {
      setSelectedType(type as HierarchyType);
      // Reset parent selection when type changes
      setParentType("");
      setParentId(null);
    }
  };

  const handleParentTypeChange = (type: string) => {
    setParentType(type === "none" ? "" : (type as HierarchyType));
    setParentId(null); // Reset parent hierarchy when parent type changes
  };

  const handleParentHierarchyChange = (value: string) => {
    setParentId(value === "none" ? null : parseInt(value));
  };

  const handleSave = async () => {
    if (!hierarchyName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a hierarchy name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = {
        type: selectedType,
        name: hierarchyName.trim(),
        parent_id: parentId,
      };

      if (onSave) {
        // Use external onSave (from EntityManagement) for proper cache invalidation
        await onSave(data, isEditing && editItem ? editItem.id : undefined);
      } else {
        // Fallback to internal mutations for backward compatibility
        if (isEditing && editItem) {
          await updateMutation.mutateAsync({
            id: editItem.id,
            data,
          });
        } else {
          await createMutation.mutateAsync(data);
        }
      }

      handleCancel();
    } catch (_error) {
      // Error handling is done in the mutation hooks or external onSave
    }
  };

  const handleCancel = () => {
    setSelectedType("UNIT");
    setHierarchyName("");
    setParentType("");
    setParentId(null);
    onOpenChange(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const availableParentTypes = getAvailableParentTypes();
  const availableParentHierarchies = getAvailableParentHierarchies();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Hierarchy" : "Create New Hierarchy"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the hierarchy item details."
              : "Create a new hierarchy item by selecting its type and optional parent."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Hierarchy Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Hierarchy Type</label>
            <ToggleGroup
              type="single"
              value={selectedType}
              onValueChange={handleTypeChange}
              className="justify-start w-full"
              disabled={isLoading}
            >
              {hierarchyOrder.map((type) => {
                const Icon = getHierarchyIcon(type);
                return (
                  <ToggleGroupItem key={type} value={type} className="flex items-center gap-2 px-3 py-2 flex-1">
                    <Icon className="h-4 w-4" />
                    {formatTypeDisplay(type)}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>

          {/* Parent Selection - Only show if there are available parent types */}
          {availableParentTypes.length > 0 && (
            <div className="grid grid-cols-12 gap-4">
              {/* Parent Type Selection */}
              <div className="col-span-5 space-y-2">
                <label className="text-sm font-medium">Parent Type (Optional)</label>
                <Select value={parentType || "none"} onValueChange={handleParentTypeChange} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">None (No parent)</span>
                      </div>
                    </SelectItem>
                    {availableParentTypes.map((type) => {
                      const Icon = getHierarchyIcon(type);
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {formatTypeDisplay(type)}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Parent Hierarchy Selection */}
              <div className="col-span-7 space-y-2">
                <label className="text-sm font-medium">
                  {parentType ? `Parent ${formatTypeDisplay(parentType)}` : "Parent Hierarchy"}
                </label>
                <Select
                  value={parentId?.toString() || "none"}
                  onValueChange={handleParentHierarchyChange}
                  disabled={isLoading || !parentType}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        parentType
                          ? `Select parent ${formatTypeDisplay(parentType).toLowerCase()}`
                          : "Select parent type first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-gray-500">None</span>
                    </SelectItem>
                    {availableParentHierarchies.map((hierarchy) => (
                      <SelectItem key={hierarchy.id} value={hierarchy.id.toString()}>
                        {hierarchy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Hierarchy Name - Now at the end */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{formatTypeDisplay(selectedType)} Name</label>
            <Input
              placeholder={`Enter ${formatTypeDisplay(selectedType).toLowerCase()} name`}
              value={hierarchyName}
              onChange={(e) => setHierarchyName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
