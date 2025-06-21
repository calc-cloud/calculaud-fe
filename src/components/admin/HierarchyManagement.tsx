
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, MoreHorizontal, Building2, Building, Users, User, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/tables/TablePagination';
import { useAdminData } from '@/contexts/AdminDataContext';
import { CreateHierarchyModal } from './CreateHierarchyModal';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hierarchyToDelete, setHierarchyToDelete] = useState<HierarchyItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingHierarchy, setEditingHierarchy] = useState<HierarchyItem | null>(null);
  const {
    toast
  } = useToast();
  const itemsPerPage = 10;
  
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

  const handleCreate = () => {
    setEditingHierarchy(null);
    setCreateModalOpen(true);
  };

  const handleEdit = (hierarchy: HierarchyItem) => {
    setEditingHierarchy(hierarchy);
    setCreateModalOpen(true);
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

  const handleModalClose = (open: boolean) => {
    setCreateModalOpen(open);
    if (!open) {
      setEditingHierarchy(null);
    }
  };

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

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
          <CardTitle className="text-lg">Hierarchy Management</CardTitle>
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Hierarchy
          </Button>
        </CardHeader>
        <CardContent className="pt-2 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="relative flex-shrink-0 mb-4 mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search hierarchies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 focus-visible:ring-1"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {paginatedHierarchies.length > 0 ? (
                <div className="space-y-2">
                  {paginatedHierarchies.map(hierarchy => (
                    <div key={hierarchy.id} className="flex items-center justify-between p-3 border rounded text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center my-4">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No hierarchies found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery ? `No hierarchies match "${searchQuery}"` : 'No hierarchies available'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {filteredHierarchies.length > 0 && (
              <div className="flex-shrink-0 mt-4">
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
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
      </Card>

      <CreateHierarchyModal 
        open={createModalOpen} 
        onOpenChange={handleModalClose}
        editItem={editingHierarchy}
      />
    </>
  );
};

export default HierarchyManagement;
