
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, MoreHorizontal, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/tables/TablePagination';
import { serviceTypeService } from '@/services/serviceTypeService';
import { ServiceType } from '@/types/serviceTypes';
import { API_CONFIG } from '@/config/api';
import ServiceTypeModal from './ServiceTypeModal';

const ServiceTypeManagement = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState<ServiceType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceTypeToDelete, setServiceTypeToDelete] = useState<ServiceType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
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

  // Fetch service types
  const fetchServiceTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await serviceTypeService.getServiceTypes({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
      });
      
      setServiceTypes(response.data);
      setTotalPages(response.total_pages);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Error fetching service types:', error);
      toast({
        title: "Error loading service types",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, itemsPerPage, toast]);

  useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);

  const handleCreate = () => {
    setEditingServiceType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (serviceType: ServiceType) => {
    setEditingServiceType(serviceType);
    setIsModalOpen(true);
  };

  const handleSave = async (name: string, editId?: number) => {
    try {
      if (editId) {
        await serviceTypeService.updateServiceType(editId, { name });
        toast({ title: "Service type updated successfully" });
      } else {
        await serviceTypeService.createServiceType({ name });
        toast({ title: "Service type created successfully" });
      }
      
      await fetchServiceTypes();
    } catch (error) {
      console.error('Error saving service type:', error);
      toast({
        title: "Error saving service type",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
      throw error; // Re-throw to let modal handle loading state
    }
  };

  const handleDeleteClick = (serviceType: ServiceType) => {
    setServiceTypeToDelete(serviceType);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!serviceTypeToDelete) return;
    
    setIsDeleting(true);
    try {
      await serviceTypeService.deleteServiceType(serviceTypeToDelete.id);
      toast({ title: "Service type deleted successfully" });
      setDeleteDialogOpen(false);
      setServiceTypeToDelete(null);
      await fetchServiceTypes();
    } catch (error) {
      console.error('Error deleting service type:', error);
      toast({
        title: "Error deleting service type",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
        <CardTitle className="text-lg">Service Type Management</CardTitle>
        <Button onClick={handleCreate} size="sm" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-1" />
          Add Service Type
        </Button>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="relative flex-shrink-0 mb-4 mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search service types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 focus-visible:ring-1"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500 text-lg font-medium">Loading service types...</p>
                </div>
              </div>
            ) : serviceTypes.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">
                {serviceTypes.map((serviceType) => (
                  <div key={serviceType.id} className="p-6 border rounded-lg text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate flex-1 mr-3" title={serviceType.name}>
                        {serviceType.name}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(serviceType)}>
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(serviceType)} className="text-red-600">
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
                <div className="text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No service types found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {debouncedSearch ? `No service types match "${debouncedSearch}"` : 'No service types available'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!isLoading && totalCount > 0 && (
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

      <ServiceTypeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editItem={editingServiceType}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service type? This action cannot be undone.
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

export default ServiceTypeManagement;
