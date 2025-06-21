
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Building, Users, User, UserCheck } from 'lucide-react';
import { useAdminData } from '@/contexts/AdminDataContext';
import { useToast } from '@/hooks/use-toast';

type HierarchyType = 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team';

interface HierarchyItem {
  id: string;
  type: HierarchyType;
  name: string;
  parentId?: string;
  fullPath: string;
}

interface CreateHierarchyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: HierarchyItem | null;
}

const hierarchyOrder: HierarchyType[] = ['Unit', 'Center', 'Anaf', 'Mador', 'Team'];

const getHierarchyIcon = (type: HierarchyType) => {
  switch (type) {
    case 'Unit':
      return Building2;
    case 'Center':
      return Building;
    case 'Anaf':
      return Users;
    case 'Mador':
      return User;
    case 'Team':
      return UserCheck;
  }
};

export const CreateHierarchyModal: React.FC<CreateHierarchyModalProps> = ({
  open,
  onOpenChange,
  editItem
}) => {
  const { hierarchies, setHierarchies } = useAdminData();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<HierarchyType>('Unit');
  const [selectedParentType, setSelectedParentType] = useState<HierarchyType>('Unit');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [hierarchyName, setHierarchyName] = useState('');

  const isEditing = !!editItem;

  // Initialize form with edit data when editing
  useEffect(() => {
    if (editItem && open) {
      setSelectedType(editItem.type);
      setHierarchyName(editItem.name);
      
      if (editItem.parentId) {
        const parent = hierarchies.find(h => h.id === editItem.parentId);
        if (parent) {
          setSelectedParentType(parent.type);
          setSelectedParentId(editItem.parentId);
        }
      } else {
        setSelectedParentType('Unit');
        setSelectedParentId('');
      }
    } else if (!editItem) {
      // Reset form when creating new
      setSelectedType('Unit');
      setSelectedParentType('Unit');
      setSelectedParentId('');
      setHierarchyName('');
    }
  }, [editItem, open, hierarchies]);

  // Get valid parent types (only higher hierarchy levels)
  const getValidParentTypes = (currentType: HierarchyType): HierarchyType[] => {
    const currentIndex = hierarchyOrder.indexOf(currentType);
    return hierarchyOrder.slice(0, currentIndex);
  };

  // Get available parent hierarchies of the selected parent type
  const getAvailableParents = () => {
    // When editing, exclude the current item and its children from parent options
    if (isEditing && editItem) {
      return hierarchies.filter(h => 
        h.type === selectedParentType && 
        h.id !== editItem.id &&
        !h.fullPath.startsWith(editItem.fullPath + ' > ')
      );
    }
    return hierarchies.filter(h => h.type === selectedParentType);
  };

  const validParentTypes = getValidParentTypes(selectedType);
  const availableParents = getAvailableParents();
  const selectedParent = hierarchies.find(h => h.id === selectedParentId);

  const handleTypeChange = (type: string) => {
    if (type) {
      setSelectedType(type as HierarchyType);
      setSelectedParentType('Unit');
      setSelectedParentId('');
    }
  };

  const handleParentTypeChange = (parentType: string) => {
    setSelectedParentType(parentType as HierarchyType);
    setSelectedParentId('');
  };

  const handleParentSelect = (parentId: string) => {
    setSelectedParentId(parentId);
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

    if (selectedType !== 'Unit' && !selectedParentId) {
      toast({
        title: "Parent required",
        description: "Please select a parent hierarchy.",
        variant: "destructive"
      });
      return;
    }

    const fullPath = selectedType === 'Unit' 
      ? hierarchyName.trim()
      : `${selectedParent?.fullPath} > ${hierarchyName.trim()}`;

    if (isEditing && editItem) {
      // Update existing hierarchy
      const updatedHierarchy = {
        ...editItem,
        type: selectedType,
        name: hierarchyName.trim(),
        parentId: selectedType === 'Unit' ? undefined : selectedParentId,
        fullPath
      };

      setHierarchies(prev => {
        const updated = prev.map(h => h.id === editItem.id ? updatedHierarchy : h);
        
        // Update children paths if the parent path changed
        if (editItem.fullPath !== fullPath) {
          return updated.map(h => {
            if (h.fullPath.startsWith(editItem.fullPath + ' > ')) {
              const childPath = h.fullPath.substring(editItem.fullPath.length + 3);
              return {
                ...h,
                fullPath: `${fullPath} > ${childPath}`
              };
            }
            return h;
          });
        }
        
        return updated;
      });

      toast({
        title: "Hierarchy updated successfully"
      });
    } else {
      // Create new hierarchy
      const newHierarchy = {
        id: Date.now().toString(),
        type: selectedType,
        name: hierarchyName.trim(),
        parentId: selectedType === 'Unit' ? undefined : selectedParentId,
        fullPath
      };

      setHierarchies(prev => [...prev, newHierarchy]);
      
      toast({
        title: "Hierarchy created successfully"
      });
    }

    handleCancel();
  };

  const handleCancel = () => {
    setSelectedType('Unit');
    setSelectedParentType('Unit');
    setSelectedParentId('');
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
              : 'Create a new hierarchy item by selecting its type and parent.'
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
                    {type}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>

          {/* Parent Type and Parent Selection */}
          {selectedType !== 'Unit' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Type</label>
                <Select value={selectedParentType} onValueChange={handleParentTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validParentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Parent {selectedParentType}</label>
                <Select value={selectedParentId} onValueChange={handleParentSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${selectedParentType.toLowerCase()}...`} />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border shadow-lg">
                    {availableParents.length > 0 ? (
                      availableParents.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No {selectedParentType.toLowerCase()} found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Hierarchy Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {selectedType} Name
            </label>
            <Input
              placeholder={`Enter ${selectedType.toLowerCase()} name`}
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
