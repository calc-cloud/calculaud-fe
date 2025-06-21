
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Building, Users, User, UserCheck } from 'lucide-react';
import { useAdminData } from '@/contexts/AdminDataContext';
import { useToast } from '@/hooks/use-toast';

type HierarchyType = 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team';

interface CreateHierarchyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  onOpenChange
}) => {
  const { hierarchies, setHierarchies } = useAdminData();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<HierarchyType>('Unit');
  const [selectedParentType, setSelectedParentType] = useState<HierarchyType>('Unit');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [hierarchyName, setHierarchyName] = useState('');

  // Get valid parent types (only higher hierarchy levels)
  const getValidParentTypes = (currentType: HierarchyType): HierarchyType[] => {
    const currentIndex = hierarchyOrder.indexOf(currentType);
    return hierarchyOrder.slice(0, currentIndex);
  };

  // Get available parent hierarchies of the selected parent type
  const getAvailableParents = () => {
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

  const handleCreate = () => {
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

    const newHierarchy = {
      id: Date.now().toString(),
      type: selectedType,
      name: hierarchyName.trim(),
      parentId: selectedType === 'Unit' ? undefined : selectedParentId,
      fullPath: selectedType === 'Unit' 
        ? hierarchyName.trim()
        : `${selectedParent?.fullPath} > ${hierarchyName.trim()}`
    };

    setHierarchies(prev => [...prev, newHierarchy]);
    
    toast({
      title: "Hierarchy created successfully"
    });

    // Reset form
    setSelectedType('Unit');
    setSelectedParentType('Unit');
    setSelectedParentId('');
    setHierarchyName('');
    onOpenChange(false);
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
          <DialogTitle>Create New Hierarchy</DialogTitle>
          <DialogDescription>
            Create a new hierarchy item by selecting its type and parent.
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
          <Button onClick={handleCreate}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
