import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, MoreHorizontal, Loader, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { TablePagination } from '@/components/tables/TablePagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { API_CONFIG } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { materialService } from '@/services/materialService';
import { Material } from '@/types/materials';

import MaterialModal from './MaterialModal';


const MaterialManagement = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const { data: serviceTypesData } = useServiceTypes();
  const queryClient = useQueryClient();
  const itemsPerPage = API_CONFIG.PAGINATION.DEFAULT_LIMIT;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, API_CONFIG.SEARCH.DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch materials
  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await materialService.getMaterials({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
      });
      setMaterials(response.items || []);
      setTotalPages(response.pages || 1);
      setTotalCount(response.total || 0);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to connect to API');
      toast({
        title: "API Connection Error",
        description: "Unable to connect to the backend API. The interface will work with limited functionality.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, itemsPerPage, toast]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleCreate = () => {
    if (apiError) {
      toast({
        title: "API Connection Required",
        description: "Cannot create materials without API connection.",
        variant: "destructive"
      });
      return;
    }
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (material: Material) => {
    if (apiError) {
      toast({
        title: "API Connection Required",
        description: "Cannot edit materials without API connection.",
        variant: "destructive"
      });
      return;
    }
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleSave = async (name: string, serviceTypeId: number, editId?: number) => {
    try {
      if (editId) {
        await materialService.updateMaterial(editId, { name, service_type_id: serviceTypeId });
        toast({ title: "Material updated successfully" });
      } else {
        await materialService.createMaterial({ name, service_type_id: serviceTypeId });
        toast({ title: "Material created successfully" });
      }
      
      // Invalidate the React Query cache so other components get updated data
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      
      await fetchMaterials();
    } catch (error) {
      toast({
        title: "Error saving material",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleDeleteClick = (material: Material) => {
    if (apiError) {
      toast({
        title: "API Connection Required",
        description: "Cannot delete materials without API connection.",
        variant: "destructive"
      });
      return;
    }
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    
    setIsDeleting(true);
    try {
      await materialService.deleteMaterial(materialToDelete.id);
      toast({ title: "Material deleted successfully" });
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
      
      // Invalidate the React Query cache so other components get updated data
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      
      await fetchMaterials();
    } catch (error) {
      toast({
        title: "Error deleting material",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetryConnection = () => {
    fetchMaterials();
  };

  const getServiceTypeName = (serviceTypeId: number) => {
    const serviceType = serviceTypesData?.items?.find(st => st.id === serviceTypeId);
    return serviceType?.name || 'Unknown';
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
        <CardTitle className="text-lg">Material Management</CardTitle>
        <div className="flex items-center gap-2">
          {apiError && (
            <Button onClick={handleRetryConnection} variant="outline" size="sm">
              Retry Connection
            </Button>
          )}
          <Button onClick={handleCreate} size="sm" disabled={isLoading || !!apiError}>
            <Plus className="h-4 w-4 mr-1" />
            Add Material
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">API Connection Error</p>
                <p className="text-xs text-red-600 mt-1">{apiError}</p>
              </div>
            </div>
          )}
          
          <div className="relative flex-shrink-0 mb-4 mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 focus-visible:ring-1"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center my-4">
                  <Loader className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500 text-lg font-medium">Loading materials...</p>
                </div>
              </div>
            ) : apiError ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center my-4">
                  <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-500 text-lg font-medium">Unable to load materials</p>
                  <p className="text-red-400 text-sm mt-1">Check console for detailed error information</p>
                  <Button onClick={handleRetryConnection} variant="outline" size="sm" className="mt-3">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : materials.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">
                {materials.map((material) => (
                  <div key={material.id} className="p-6 border rounded-lg text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium truncate flex-1 mr-3" title={material.name}>
                        {material.name}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(material)}>
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(material)} className="text-red-600">
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-gray-500">
                      Type: {getServiceTypeName(material.service_type_id)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center my-4">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No materials found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {debouncedSearch ? `No materials match "${debouncedSearch}"` : 'No materials available'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!isLoading && !apiError && totalCount > 0 && (
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

      <MaterialModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editItem={editingMaterial}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this material? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default MaterialManagement;
