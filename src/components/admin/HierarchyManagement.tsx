import { Plus, Edit, Trash2, Search, MoreHorizontal, Building2, Building, Users, User, UserCheck, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { TablePagination } from '@/components/tables/TablePagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { API_CONFIG } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { useHierarchies } from '@/hooks/useHierarchies';
import { useDeleteHierarchy } from '@/hooks/useHierarchyMutations';
import { Hierarchy, HierarchyType } from '@/types/hierarchies';

import { CreateHierarchyModal } from './CreateHierarchyModal';


const HierarchyManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hierarchyToDelete, setHierarchyToDelete] = useState<Hierarchy | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingHierarchy, setEditingHierarchy] = useState<Hierarchy | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 10;
  
  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, API_CONFIG.SEARCH.DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch hierarchies using the API with debounced search
  const { data: hierarchiesData, isLoading, error, refetch } = useHierarchies({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
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
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const hierarchies = hierarchiesData?.items || [];
  const totalPages = hierarchiesData?.pages || 1;

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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Loading hierarchies...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="text-red-500 mb-4">
                      <Search className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Failed to load hierarchies</p>
                      <p className="text-xs text-gray-500 mt-1">{error.message}</p>
                    </div>
                    <Button onClick={() => refetch()} variant="outline" size="sm">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : hierarchies.length > 0 ? (
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
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {debouncedSearch ? 'No hierarchies found matching your search.' : 'No hierarchies found.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {totalPages > 1 && (
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

      <CreateHierarchyModal
        open={createModalOpen}
        onOpenChange={handleModalClose}
        editItem={editingHierarchy}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hierarchy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{hierarchyToDelete?.path}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HierarchyManagement;
