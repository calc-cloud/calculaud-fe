
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, MoreHorizontal, Building2, Building, Users, User, UserCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/tables/TablePagination';
import { CreateHierarchyModal } from './CreateHierarchyModal';
import { useHierarchies } from '@/hooks/useHierarchies';
import { useDeleteHierarchy } from '@/hooks/useHierarchyMutations';
import { Hierarchy, HierarchyType } from '@/types/hierarchies';

const HierarchyManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hierarchyToDelete, setHierarchyToDelete] = useState<Hierarchy | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingHierarchy, setEditingHierarchy] = useState<Hierarchy | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 10;
  
  // Fetch hierarchies using the API
  const { data: hierarchiesData, isLoading, error, refetch } = useHierarchies({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    sort_by: 'name',
    sort_order: 'asc'
  });

  // Delete mutation
  const deleteMutation = useDeleteHierarchy();
  
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
      case 'MADOR':
        return User;
      default:
        return Building2;
    }
  };

  const formatTypeDisplay = (type: HierarchyType): string => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const handleCreate = () => {
    setEditingHierarchy(null);
    setCreateModalOpen(true);
  };

  const handleEdit = (hierarchy: Hierarchy) => {
    setEditingHierarchy(hierarchy);
    setCreateModalOpen(true);
  };

  const handleDeleteClick = (hierarchy: Hierarchy) => {
    setHierarchyToDelete(hierarchy);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (hierarchyToDelete) {
      try {
        await deleteMutation.mutateAsync(hierarchyToDelete.id);
        setDeleteDialogOpen(false);
        setHierarchyToDelete(null);
      } catch (error) {
        // Error handling is done in the mutation hook
        console.error('Delete hierarchy error:', error);
      }
    }
  };

  const handleModalClose = (open: boolean) => {
    setCreateModalOpen(open);
    if (!open) {
      setEditingHierarchy(null);
    }
  };

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
          <CardTitle className="text-lg">Hierarchy Management</CardTitle>
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Hierarchy
          </Button>
        </CardHeader>
        <CardContent className="pt-2 flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading hierarchies...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
          <CardTitle className="text-lg">Hierarchy Management</CardTitle>
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Hierarchy
          </Button>
        </CardHeader>
        <CardContent className="pt-2 flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <Search className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Failed to load hierarchies</p>
                <p className="text-sm text-gray-500 mt-1">{error.message}</p>
              </div>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hierarchies = hierarchiesData?.items || [];
  const totalPages = hierarchiesData?.pages || 1;

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
          <CardTitle className="text-lg">Hierarchy Management</CardTitle>
          <Button onClick={handleCreate} size="sm" disabled={isLoading}>
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
                disabled={isLoading}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {hierarchies.length > 0 ? (
                <div className="space-y-2">
                  {hierarchies.map(hierarchy => (
                    <div key={hierarchy.id} className="flex items-center justify-between p-3 border rounded text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm">{hierarchy.path}</p>
                        <p className="text-xs text-gray-500 mt-1">Type: {formatTypeDisplay(hierarchy.type)}</p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={deleteMutation.isPending}>
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(hierarchy)}>
                              <Edit className="h-3 w-3 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(hierarchy)} 
                              className="text-red-600"
                              disabled={deleteMutation.isPending}
                            >
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

            {hierarchies.length > 0 && (
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
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hierarchy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{hierarchyToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateHierarchyModal 
        open={createModalOpen} 
        onOpenChange={handleModalClose}
        editItem={editingHierarchy}
      />
    </>
  );
};

export default HierarchyManagement;
