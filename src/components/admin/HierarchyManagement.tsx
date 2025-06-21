import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/tables/TablePagination';
import { useAdminData } from '@/contexts/AdminDataContext';
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
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [hierarchyName, setHierarchyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hierarchyToDelete, setHierarchyToDelete] = useState<HierarchyItem | null>(null);
  const {
    toast
  } = useToast();
  const itemsPerPage = 15; // Increased from 10

  const hierarchyTypes: HierarchyType[] = ['Unit', 'Center', 'Anaf', 'Mador', 'Team'];
  const getParentOptions = (type: HierarchyType) => {
    const typeOrder = ['Unit', 'Center', 'Anaf', 'Mador', 'Team'];
    const currentIndex = typeOrder.indexOf(type);
    if (currentIndex === 0) return []; // Unit has no parent

    const parentType = typeOrder[currentIndex - 1] as HierarchyType;
    return hierarchies.filter(h => h.type === parentType);
  };
  const getParentTypeName = (type: HierarchyType): string => {
    const typeOrder = ['Unit', 'Center', 'Anaf', 'Mador', 'Team'];
    const currentIndex = typeOrder.indexOf(type);
    if (currentIndex === 0) return '';
    return typeOrder[currentIndex - 1];
  };
  const buildFullPath = (name: string, parentId?: string): string => {
    if (!parentId) return name;
    const parent = hierarchies.find(h => h.id === parentId);
    return parent ? `${parent.fullPath} > ${name}` : name;
  };
  const handleCreate = () => {
    setEditingHierarchy(null);
    setSelectedType('Unit');
    setSelectedParent('');
    setHierarchyName('');
    setIsDialogOpen(true);
  };
  const handleEdit = (hierarchy: HierarchyItem) => {
    setEditingHierarchy(hierarchy);
    setSelectedType(hierarchy.type);
    setSelectedParent(hierarchy.parentId || '');
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
    const parentOptions = getParentOptions(selectedType);
    if (parentOptions.length > 0 && !selectedParent) {
      const parentTypeName = getParentTypeName(selectedType);
      toast({
        title: `Please select a parent ${parentTypeName}`,
        variant: "destructive"
      });
      return;
    }

    // For types that require a parent but no parent options exist, show error
    if (selectedType !== 'Unit' && parentOptions.length === 0) {
      const parentTypeName = getParentTypeName(selectedType);
      toast({
        title: `No ${parentTypeName} hierarchies available`,
        description: `Please create a ${parentTypeName} hierarchy first.`,
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
  const parentOptions = getParentOptions(selectedType);
  const parentTypeName = getParentTypeName(selectedType);

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
                <RadioGroup value={selectedType} onValueChange={value => {
                setSelectedType(value as HierarchyType);
                setSelectedParent(''); // Clear parent when type changes
              }} className="mt-1">
                  {hierarchyTypes.map(type => <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="text-sm">{type}</Label>
                    </div>)}
                </RadioGroup>
              </div>

              {selectedType !== 'Unit' && <div>
                  <Label htmlFor="parent" className="text-sm">Parent {parentTypeName}</Label>
                  <Select value={selectedParent} onValueChange={setSelectedParent}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder={`Select parent ${parentTypeName.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {parentOptions.map(parent => <SelectItem key={parent.id} value={parent.id}>
                          {parent.fullPath}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>}

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
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input placeholder="Search hierarchies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-7 h-8 text-sm" />
          </div>
          
          <div className="space-y-1">
            {paginatedHierarchies.map(hierarchy => <div key={hierarchy.id} className="flex items-center justify-between p-2 border rounded text-sm bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{hierarchy.fullPath}</p>
                  <p className="text-xs text-gray-500">Type: {hierarchy.type}</p>
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