
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/tables/TablePagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/services/supplierService';
import { Supplier } from '@/types/suppliers';

const SupplierManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const itemsPerPage = 12;

  // Fetch suppliers with search and pagination
  const { data: suppliersResponse, isLoading, error } = useQuery({
    queryKey: ['suppliers', currentPage, searchQuery],
    queryFn: () => supplierService.getSuppliers({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined
    }),
  });

  console.log('Fetching suppliers with params:', { page: currentPage, limit: itemsPerPage, search: searchQuery });

  // Create supplier mutation
  const createMutation = useMutation({
    mutationFn: supplierService.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: "Supplier created successfully" });
      setIsDialogOpen(false);
      setSupplierName('');
    },
    onError: (error: any) => {
      console.error('Create supplier error:', error);
      toast({ 
        title: "Failed to create supplier", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    },
  });

  // Update supplier mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      supplierService.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: "Supplier updated successfully" });
      setIsDialogOpen(false);
      setSupplierName('');
      setEditingSupplier(null);
    },
    onError: (error: any) => {
      console.error('Update supplier error:', error);
      toast({ 
        title: "Failed to update supplier", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    },
  });

  // Delete supplier mutation
  const deleteMutation = useMutation({
    mutationFn: supplierService.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: "Supplier deleted successfully" });
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    },
    onError: (error: any) => {
      console.error('Delete supplier error:', error);
      toast({ 
        title: "Failed to delete supplier", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    },
  });

  const handleCreate = () => {
    setEditingSupplier(null);
    setSupplierName('');
    setIsDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierName(supplier.name);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!supplierName.trim()) {
      toast({ title: "Please enter a supplier name", variant: "destructive" });
      return;
    }

    if (editingSupplier) {
      updateMutation.mutate({
        id: editingSupplier.id,
        data: { name: supplierName.trim() }
      });
    } else {
      createMutation.mutate({ name: supplierName.trim() });
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (supplierToDelete) {
      deleteMutation.mutate(supplierToDelete.id);
    }
  };

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const suppliers = suppliersResponse?.items || [];
  const totalPages = suppliersResponse?.pages || 0;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
        <CardTitle className="text-lg">Supplier Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Edit Supplier' : 'Create New Supplier'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="supplierName" className="text-sm mb-2 block">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Enter supplier name"
                  className="h-8"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} size="sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  size="sm"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingSupplier ? 'Update' : 'Create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="relative flex-shrink-0 mb-4 mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 focus-visible:ring-1"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center my-4">
                  <p className="text-gray-500 text-lg font-medium">Loading suppliers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center my-4">
                  <p className="text-red-500 text-lg font-medium">Error loading suppliers</p>
                  <p className="text-gray-400 text-sm mt-1">Please try again</p>
                </div>
              </div>
            ) : suppliers.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="p-6 border rounded-lg text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate flex-1 mr-3" title={supplier.name}>
                        {supplier.name}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(supplier)} className="text-red-600">
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
                  <p className="text-gray-500 text-lg font-medium">No suppliers found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchQuery ? `No suppliers match "${searchQuery}"` : 'No suppliers available'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {suppliersResponse && suppliersResponse.total > 0 && (
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
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this supplier? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SupplierManagement;
