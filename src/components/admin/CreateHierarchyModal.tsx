
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Building, Users, User, UserCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Hierarchy, HierarchyType } from '@/types/hierarchies';
import { useCreateHierarchy, useUpdateHierarchy } from '@/hooks/useHierarchyMutations';
import { useHierarchies } from '@/hooks/useHierarchies';

interface CreateHierarchyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Hierarchy | null;
}

const hierarchyOrder: HierarchyType[] = ['UNIT', 'CENTER', 'ANAF', 'MADOR', 'TEAM'];

const getHierarchyIcon = (type: HierarchyType) => {
  switch (type) {
    case 'UNIT':
      return Building2;
    case 'CENTER':
      return Building;
    case 'ANAF':
      return Users;
    case 'MADOR':
      return User;
    case 'TEAM':
      return UserCheck;
  }
};

const formatTypeDisplay = (type: HierarchyType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

export const CreateHierarchyModal: React.FC<CreateHierarchyModalProps> = ({
  open,
  onOpenChange,
  editItem
}) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<HierarchyType>('UNIT');
  const [hierarchyName, setHierarchyName] = useState('');
  const [parentType, setParentType] = useState<HierarchyType | ''>('');
  const [parentId, setParentId] = useState<number | null>(null);

  const isEditing = !!editItem;

  // Mutation hooks
  const createMutation = useCreateHierarchy();
  const updateMutation = useUpdateHierarchy();

  // Fetch hierarchies for parent selection
  const { data: hierarchiesData } = useHierarchies();
  const availableHierarchies = hierarchiesData?.items || [];

  // Get available parent types (only higher levels in hierarchy)
  const getAvailableParentTypes = (): HierarchyType[] => {
    const currentIndex = hierarchyOrder.indexOf(selectedType);
    // Return only types that come before the selected type (higher in hierarchy)
    return hierarchyOrder.slice(0, currentIndex);
  };

  // Get available parent hierarchies based on selected parent type
  const getAvailableParentHierarchies = (): Hierarchy[] => {
    if (!parentType) return [];
    return availableHierarchies.filter(h => h.type === parentType);
  };

  // Initialize form with edit data when editing
  useEffect(() => {
    if (editItem && open) {
      setSelectedType(editItem.type);
      setHierarchyName(editItem.name);
      // Find parent info if exists
      if (editItem.parent_id) {
        const parent = availableHierarchies.find(h => h.id === editItem.parent_id);
        if (parent) {
          setParentType(parent.type);
          setParentId(parent.id);
        }
      }
    } else if (!editItem) {
      // Reset form when creating new
      setSelectedType('UNIT');
      setHierarchyName('');
      setParentType('');
      setParentId(null);
    }
  }, [editItem, open, availableHierarchies]);

  const handleTypeChange = (type: string) => {
    if (type) {
      setSelectedType(type as HierarchyType);
      // Reset parent selection when type changes
      setParentType('');
      setParentId(null);
    }
  };

  const handleParentTypeChange = (type: string) => {
    setParentType(type as HierarchyType);
    setParentId(null); // Reset parent hierarchy when parent type changes
  };

  const handleParentHierarchyChange = (value: string) => {
    setParentId(value ? parseInt(value) : null);
  };

  const handleSave = async () => {
    if (!hierarchyName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a hierarchy name.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditing && editItem) {
        // Update existing hierarchy
        await updateMutation.mutateAsync({
          id: editItem.id,
          data: {
            type: selectedType,
            name: hierarchyName.trim(),
            parent_id: parentId,
          }
        });
      } else {
        // Create new hierarchy
        await createMutation.mutateAsync({
          type: selectedType,
          name: hierarchyName.trim(),
          parent_id: parentId,
        });
      }

      handleCancel();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Save hierarchy error:', error);
    }
  };

  const handleCancel = () => {
    setSelectedType('UNIT');
    setHierarchyName('');
    setParentType('');
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
          <DialogTitle>
            {isEditing ? 'Edit Hierarchy' : 'Create New Hierarchy'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the hierarchy item details.'
              : 'Create a new hierarchy item by selecting its type and optional parent.'
            }
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
                  <ToggleGroupItem 
                    key={type} 
                    value={type}
                    className="flex items-center gap-2 px-3 py-2 flex-1"
                  >
                    <Icon className="h-4 w-4" />
                    {formatTypeDisplay(type)}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>

          {/* Parent Selection - Only show if there are available parent types */}
          {availableParentTypes.length > 0 && (
            <div className="grid grid-cols-5 gap-4">
              {/* Parent Type Selection */}
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Parent Type (Optional)</label>
                <Select value={parentType} onValueChange={handleParentTypeChange} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent type" />
                  </SelectTrigger>
                  <SelectContent>
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
              <div className="col-span-3 space-y-2">
                <label className="text-sm font-medium">
                  {parentType ? `Parent ${formatTypeDisplay(parentType)}` : 'Parent Hierarchy'}
                </label>
                <Select 
                  value={parentId?.toString() || ''} 
                  onValueChange={handleParentHierarchyChange} 
                  disabled={isLoading || !parentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      parentType 
                        ? `Select parent ${formatTypeDisplay(parentType).toLowerCase()}` 
                        : 'Select parent type first'
                    } />
                  </SelectTrigger>
                  <SelectContent>
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
            <label className="text-sm font-medium">
              {formatTypeDisplay(selectedType)} Name
            </label>
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
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
