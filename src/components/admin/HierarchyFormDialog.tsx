
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { HierarchyType, HierarchyItem } from '@/types/hierarchy';
import { hierarchyTypes, getHierarchyIcon, getAvailableParentTypes, getParentOptions, buildFullPath } from '@/utils/hierarchyUtils';

interface HierarchyFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingHierarchy: HierarchyItem | null;
  hierarchies: HierarchyItem[];
  onSave: (hierarchy: Omit<HierarchyItem, 'id'> & { id?: string }) => void;
}

export const HierarchyFormDialog: React.FC<HierarchyFormDialogProps> = ({
  isOpen,
  onClose,
  editingHierarchy,
  hierarchies,
  onSave
}) => {
  const [selectedType, setSelectedType] = useState<HierarchyType>('Unit');
  const [selectedParentType, setSelectedParentType] = useState<HierarchyType | ''>('');
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [hierarchyName, setHierarchyName] = useState('');
  const [parentDropdownOpen, setParentDropdownOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingHierarchy) {
      setSelectedType(editingHierarchy.type);
      setHierarchyName(editingHierarchy.name);
      
      if (editingHierarchy.parentId) {
        const parent = hierarchies.find(h => h.id === editingHierarchy.parentId);
        if (parent) {
          setSelectedParentType(parent.type);
          setSelectedParent(editingHierarchy.parentId);
        }
      } else {
        setSelectedParentType('');
        setSelectedParent('');
      }
    } else {
      setSelectedType('Unit');
      setSelectedParentType('');
      setSelectedParent('');
      setHierarchyName('');
    }
  }, [editingHierarchy, hierarchies]);

  useEffect(() => {
    setSelectedParentType('');
    setSelectedParent('');
  }, [selectedType]);

  useEffect(() => {
    setSelectedParent('');
  }, [selectedParentType]);

  const handleSave = () => {
    if (!hierarchyName.trim()) {
      toast({
        title: "Please enter a hierarchy name",
        variant: "destructive"
      });
      return;
    }

    const availableParentTypes = getAvailableParentTypes(selectedType);
    
    if (availableParentTypes.length > 0 && !selectedParentType) {
      toast({
        title: "Please select a parent type",
        variant: "destructive"
      });
      return;
    }

    if (selectedParentType && !selectedParent) {
      toast({
        title: `Please select a parent ${selectedParentType}`,
        variant: "destructive"
      });
      return;
    }

    if (selectedParentType && getParentOptions(hierarchies, selectedParentType).length === 0) {
      toast({
        title: `No ${selectedParentType} hierarchies available`,
        description: `Please create a ${selectedParentType} hierarchy first.`,
        variant: "destructive"
      });
      return;
    }
    
    const fullPath = buildFullPath(hierarchyName, selectedParent || undefined, hierarchies);
    
    const hierarchyData = {
      ...(editingHierarchy && { id: editingHierarchy.id }),
      type: selectedType,
      name: hierarchyName,
      parentId: selectedParent || undefined,
      fullPath
    };

    onSave(hierarchyData);
    onClose();
  };

  const availableParentTypes = getAvailableParentTypes(selectedType);
  const parentOptions = selectedParentType ? getParentOptions(hierarchies, selectedParentType) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingHierarchy ? 'Edit Hierarchy' : 'Create New Hierarchy'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Hierarchy Type</Label>
            <ToggleGroup 
              type="single" 
              value={selectedType} 
              onValueChange={(value) => {
                if (value) setSelectedType(value as HierarchyType);
              }} 
              className="mt-1 w-full grid grid-cols-5 gap-1"
            >
              {hierarchyTypes.map(type => {
                const Icon = getHierarchyIcon(type);
                return (
                  <ToggleGroupItem key={type} value={type} size="sm" className="flex items-center gap-1 flex-1">
                    <Icon className="h-3 w-3" />
                    <span className="text-xs">{type}</span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>

          {availableParentTypes.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="parentType" className="text-sm">Parent Type</Label>
                <Select value={selectedParentType} onValueChange={(value) => setSelectedParentType(value as HierarchyType | '')}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select parent type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableParentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedParentType && (
                <div className="col-span-2">
                  <Label htmlFor="parent" className="text-sm">Parent {selectedParentType}</Label>
                  <Popover open={parentDropdownOpen} onOpenChange={setParentDropdownOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={parentDropdownOpen}
                        className="w-full justify-between h-8"
                      >
                        {selectedParent
                          ? parentOptions.find(parent => parent.id === selectedParent)?.fullPath
                          : `Select parent ${selectedParentType.toLowerCase()}...`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder={`Search ${selectedParentType.toLowerCase()}...`} />
                        <CommandList>
                          <CommandEmpty>No {selectedParentType.toLowerCase()} found.</CommandEmpty>
                          <CommandGroup>
                            {parentOptions.map(parent => (
                              <CommandItem
                                key={parent.id}
                                value={parent.fullPath}
                                onSelect={() => {
                                  setSelectedParent(parent.id);
                                  setParentDropdownOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedParent === parent.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {parent.fullPath}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="name" className="text-sm">{selectedType} Name</Label>
            <Input 
              id="name" 
              value={hierarchyName} 
              onChange={e => setHierarchyName(e.target.value)} 
              placeholder={`Enter ${selectedType.toLowerCase()} name`} 
              className="h-8" 
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm">
              {editingHierarchy ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
