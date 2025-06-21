
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, MoreHorizontal, Building2, Building, Users, User, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/tables/TablePagination';
import { useAdminData } from '@/contexts/AdminDataContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type HierarchyType = 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team';

interface HierarchyItem {
  id: string;
  type: HierarchyType;
  name: string;
  parentId?: string;
  fullPath: string;
}

const HierarchyManagement = () => {
  const {
    hierarchies,
    setHierarchies
  } = useAdminData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHierarchy, setEditingHierarchy] = useState<HierarchyItem | null>(null);
  const [selectedType, setSelectedType] = useState<HierarchyType>('Unit');
  const [selectedParentType, setSelectedParentType] = useState<HierarchyType | ''>('');
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [hierarchyName, setHierarchyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hierarchyToDelete, setHierarchyToDelete] = useState<HierarchyItem | null>(null);
  const [parentDropdownOpen, setParentDropdownOpen] = useState(false);
  const {
    toast
  } = useToast();
  const itemsPerPage = 15;

  const hierarchyTypes: HierarchyType[] = ['Unit', 'Center', 'Anaf', 'Mador', 'Team'];
  
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
      default:
        return Building2;
    }
  };
  
  const getAvailableParentTypes = (type: HierarchyType): HierarchyType[] => {
    const typeOrder = ['Unit', 'Center', 'Anaf', 'Mador', 'Team'];
    const currentIndex = typeOrder.indexOf(type);
    if (currentIndex === 0) return []; // Unit has no parent
    
    return typeOrder.slice(0, currentIndex) as HierarchyType[];
  };

  const getParentOptions = (parentType: HierarchyType) => {
    return hierarchies.filter(h => h.type === parentType);
  };

  const buildFullPath = (name: string, parentId?: string): string => {
    if (!parentId) return name;
    const parent = hierarchies.find(h => h.id === parentId);
    return parent ? `${parent.fullPath} > ${name}` : name;
  };

  const handleCreate = () => {
    setEditingHierarchy(null);
    setSelectedType('Unit');
    setSelectedParentType('');
    setSelectedParent('');
    setHierarchyName('');
    setIsDialogOpen(true);
  };

  const handleEdit = (hierarchy: HierarchyItem) => {
    setEditingHierarchy(hierarchy);
    setSelectedType(hierarchy.type);
    
    if (hierarchy.parentId) {
      const parent = hierarchies.find(h => h.id === hierarchy.parentId);
      if (parent) {
        setSelectedParentType(parent.type);
        setSelectedParent(hierarchy.parentId);
      }
    } else {
      setSelectedParentType('');
      setSelectedParent('');
    }
    
    setHierarchyName(hierarchy.name);
    setIsDialogOpen(true);
  };

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

    // For types that require a parent but no parent options exist, show error
    if (selectedParentType && getParentOptions(selectedParentType).length === 0) {
      toast({
        title: `No ${selectedParentType} hierarchies available`,
        description: `Please create a ${selectedParentType} hierarchy first.`,
        variant: "destructive"
      });
      return;
    }
    
    const fullPath = buildFullPath(hierarchyName, selectedParent || undefined);
    
    if (editingHierarchy) {
      setHierarchies(prev => prev.map(h => h.id === editingHierarchy.id ? {
        ...h,
        type: selectedType,
        name: hierarchyName,
        parentId: selectedParent || undefined,
        fullPath
      } : h));
      toast({
        title: "Hierarchy updated successfully"
      });
    } else {
      const newHierarchy: HierarchyItem = {
        id: Date.now().toString(),
        type: selectedType,
        name: hierarchyName,
        parentId: selectedParent || undefined,
        fullPath
      };
      setHierarchies(prev => [...prev, newHierarchy]);
      toast({
        title: "Hierarchy created successfully"
      });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (hierarchy: HierarchyItem) => {
    setHierarchyToDelete(hierarchy);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (hierarchyToDelete) {
      // Check if this hierarchy has children
      const hasChildren = hierarchies.some(h => h.parentId === hierarchyToDelete.id);
      if (hasChildren) {
        toast({
          title: "Cannot delete hierarchy",
          description: "This hierarchy has child hierarchies. Please delete them first.",
          variant: "destructive"
        });
        setDeleteDialogOpen(false);
        setHierarchyToDelete(null);
        return;
      }
      setHierarchies(prev => prev.filter(h => h.id !== hierarchyToDelete.id));
      toast({
        title: "Hierarchy deleted successfully"
      });
      setDeleteDialogOpen(false);
      setHierarchyToDelete(null);
    }
  };

  const availableParentTypes = getAvailableParentTypes(selectedType);
  const parentOptions = selectedParentType ? getParentOptions(selectedParentType) : [];

  // Filter hierarchies based on search query
  const filteredHierarchies = hierarchies.filter(hierarchy => hierarchy.fullPath.toLowerCase().includes(searchQuery.toLowerCase()) || hierarchy.type.toLowerCase().includes(searchQuery.toLowerCase()));

  // Pagination calculations
  const totalPages = Math.ceil(filteredHierarchies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHierarchies = filteredHierarchies.sort((a, b) => a.fullPath.localeCompare(b.fullPath)).slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reset parent selection when type changes
  React.useEffect(() => {
    setSelectedParentType('');
    setSelectedParent('');
  }, [selectedType]);

  // Reset parent hierarchy when parent type changes
  React.useEffect(() => {
    setSelectedParent('');
  }, [selectedParentType]);

  return <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Hierarchy Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Hierarchy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
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
                  className="mt-1 flex-wrap justify-start"
                >
                  {hierarchyTypes.map(type => {
                    const Icon = getHierarchyIcon(type);
                    return (
                      <ToggleGroupItem key={type} value={type} size="sm" className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        <span className="text-xs">{type}</span>
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
              </div>

              {availableParentTypes.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
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
                    <div>
                      <Label htmlFor="parent" className="text-sm">Parent {selectedParentType}</Label>
                      <Popover open={parentDropdownOpen} onOpenChange={setParentDropdownOpen}>
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
                        <PopoverContent className="w-full p-0">
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
                <Input id="name" value={hierarchyName} onChange={e => setHierarchyName(e.target.value)} placeholder={`Enter ${selectedType.toLowerCase()} name`} className="h-8" />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} size="sm">
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">
                  {editingHierarchy ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input placeholder="Search hierarchies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-7 h-8 text-sm" />
          </div>
          
          <div className="space-y-2">
            {paginatedHierarchies.map(hierarchy => <div key={hierarchy.id} className="flex items-center justify-between p-3 border rounded text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate text-sm">{hierarchy.fullPath}</p>
                  <p className="text-xs text-gray-500 mt-1">Type: {hierarchy.type}</p>
                </div>
                <div className="flex space-x-1 ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(hierarchy)}>
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(hierarchy)} className="text-red-600">
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>)}
          </div>

          <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hierarchy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hierarchy? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>;
};

export default HierarchyManagement;
