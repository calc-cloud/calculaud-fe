
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import { DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TablePagination } from '@/components/tables/TablePagination';
import { useAdminData } from '@/contexts/AdminDataContext';
import { HierarchyItem } from '@/types/hierarchy';
import { HierarchyFormDialog } from './HierarchyFormDialog';
import { HierarchyList } from './HierarchyList';

const HierarchyManagement = () => {
  const { hierarchies, setHierarchies } = useAdminData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHierarchy, setEditingHierarchy] = useState<HierarchyItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hierarchyToDelete, setHierarchyToDelete] = useState<HierarchyItem | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 15;

  const handleCreate = () => {
    setEditingHierarchy(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (hierarchy: HierarchyItem) => {
    setEditingHierarchy(hierarchy);
    setIsDialogOpen(true);
  };

  const handleSave = (hierarchyData: Omit<HierarchyItem, 'id'> & { id?: string }) => {
    if (hierarchyData.id) {
      // Update existing hierarchy
      setHierarchies(prev => prev.map(h => 
        h.id === hierarchyData.id ? { ...hierarchyData as HierarchyItem } : h
      ));
      toast({
        title: "Hierarchy updated successfully"
      });
    } else {
      // Create new hierarchy
      const newHierarchy: HierarchyItem = {
        ...hierarchyData,
        id: Date.now().toString()
      } as HierarchyItem;
      setHierarchies(prev => [...prev, newHierarchy]);
      toast({
        title: "Hierarchy created successfully"
      });
    }
  };

  const handleDeleteClick = (hierarchy: HierarchyItem) => {
    setHierarchyToDelete(hierarchy);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (hierarchyToDelete) {
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
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Hierarchy Management</CardTitle>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Hierarchy
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input 
              placeholder="Search hierarchies..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-7 h-8 text-sm" 
            />
          </div>
          
          <HierarchyList 
            hierarchies={paginatedHierarchies}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />

          <TablePagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </CardContent>

      <HierarchyFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        editingHierarchy={editingHierarchy}
        hierarchies={hierarchies}
        onSave={handleSave}
      />

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
        </AlertDialogFooter>
      </AlertDialog>
    </Card>
  );
};

export default HierarchyManagement;
