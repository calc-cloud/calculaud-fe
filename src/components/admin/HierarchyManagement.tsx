import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const { hierarchies, setHierarchies } = useAdminData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHierarchy, setEditingHierarchy] = useState<HierarchyItem | null>(null);
  const [selectedType, setSelectedType] = useState<HierarchyType>('Unit');
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [hierarchyName, setHierarchyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();
  const itemsPerPage = 10;

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
      toast({ title: "Please enter a hierarchy name", variant: "destructive" });
      return;
    }

    const parentOptions = getParentOptions(selectedType);
    if (parentOptions.length > 0 && !selectedParent) {
      const parentTypeName = getParentTypeName(selectedType);
      toast({ title: `Please select a parent ${parentTypeName}`, variant: "destructive" });
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
      setHierarchies(prev => prev.map(h => 
        h.id === editingHierarchy.id 
          ? { 
              ...h, 
              type: selectedType,
              name: hierarchyName,
              parentId: selectedParent || undefined,
              fullPath
            }
          : h
      ));
      toast({ title: "Hierarchy updated successfully" });
    } else {
      const newHierarchy: HierarchyItem = {
        id: Date.now().toString(),
        type: selectedType,
        name: hierarchyName,
        parentId: selectedParent || undefined,
        fullPath
      };
      setHierarchies(prev => [...prev, newHierarchy]);
      toast({ title: "Hierarchy created successfully" });
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    // Check if this hierarchy has children
    const hasChildren = hierarchies.some(h => h.parentId === id);
    if (hasChildren) {
      toast({ 
        title: "Cannot delete hierarchy", 
        description: "This hierarchy has child hierarchies. Please delete them first.",
        variant: "destructive" 
      });
      return;
    }

    setHierarchies(prev => prev.filter(h => h.id !== id));
    toast({ title: "Hierarchy deleted successfully" });
  };

  const parentOptions = getParentOptions(selectedType);
  const parentTypeName = getParentTypeName(selectedType);

  // Filter hierarchies based on search query
  const filteredHierarchies = hierarchies.filter(hierarchy =>
    hierarchy.fullPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hierarchy.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredHierarchies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHierarchies = filteredHierarchies
    .sort((a, b) => a.fullPath.localeCompare(b.fullPath))
    .slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hierarchy Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Hierarchy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingHierarchy ? 'Edit Hierarchy' : 'Create New Hierarchy'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Hierarchy Type</Label>
                <RadioGroup 
                  value={selectedType} 
                  onValueChange={(value) => {
                    setSelectedType(value as HierarchyType);
                    setSelectedParent(''); // Clear parent when type changes
                  }}
                  className="mt-2"
                >
                  {hierarchyTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type}>{type}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {selectedType !== 'Unit' && (
                <div>
                  <Label htmlFor="parent">Parent {parentTypeName}</Label>
                  <Select value={selectedParent} onValueChange={setSelectedParent}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select parent ${parentTypeName.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {parentOptions.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.fullPath}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="name">{selectedType} Name</Label>
                <Input
                  id="name"
                  value={hierarchyName}
                  onChange={(e) => setHierarchyName(e.target.value)}
                  placeholder={`Enter ${selectedType.toLowerCase()} name`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingHierarchy ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search hierarchies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="space-y-2">
            {paginatedHierarchies.map((hierarchy) => (
              <div key={hierarchy.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{hierarchy.fullPath}</p>
                  <p className="text-sm text-gray-500">Type: {hierarchy.type}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(hierarchy)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Hierarchy</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this hierarchy? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(hierarchy.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HierarchyManagement;
