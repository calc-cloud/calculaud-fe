
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Building, Users, User, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Hierarchy, HierarchyType } from '@/types/hierarchies';

interface CreateHierarchyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Hierarchy | null;
}

const hierarchyOrder: HierarchyType[] = ['UNIT', 'CENTER', 'ANAF', 'TEAM'];

const getHierarchyIcon = (type: HierarchyType) => {
  switch (type) {
    case 'UNIT':
      return Building2;
    case 'CENTER':
      return Building;
    case 'ANAF':
      return Users;
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

  const isEditing = !!editItem;

  // Initialize form with edit data when editing
  useEffect(() => {
    if (editItem && open) {
      setSelectedType(editItem.type);
      setHierarchyName(editItem.name);
    } else if (!editItem) {
      // Reset form when creating new
      setSelectedType('UNIT');
      setHierarchyName('');
    }
  }, [editItem, open]);

  const handleTypeChange = (type: string) => {
    if (type) {
      setSelectedType(type as HierarchyType);
    }
  };

  const handleSave = () => {
    if (!hierarchyName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a hierarchy name.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement actual create/update functionality
    toast({
      title: isEditing ? "Update functionality not implemented yet" : "Create functionality not implemented yet",
      description: "This will be implemented in the next step.",
      variant: "destructive"
    });

    handleCancel();
  };

  const handleCancel = () => {
    setSelectedType('UNIT');
    setHierarchyName('');
    onOpenChange(false);
  };

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
              : 'Create a new hierarchy item by selecting its type.'
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

          {/* Hierarchy Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {formatTypeDisplay(selectedType)} Name
            </label>
            <Input
              placeholder={`Enter ${formatTypeDisplay(selectedType).toLowerCase()} name`}
              value={hierarchyName}
              onChange={(e) => setHierarchyName(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
