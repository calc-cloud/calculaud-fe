
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, MoreHorizontal, Loader, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/tables/TablePagination';
import { supplierService } from '@/services/supplierService';
import { Supplier } from '@/types/suppliers';
import { API_CONFIG } from '@/config/api';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await supplierService.getSuppliers({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
      });
      setSuppliers(response.items || []);
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
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleCreate = () => {
    if (apiError) {
      toast({
        title: "API Connection Required",
        description: "Cannot create suppliers without API connection.",
        variant: "destructive"
      });
      return;
    }
    setEditingSupplier(null);
    setSupplierName('');
    setIsDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    if (apiError) {
      toast({
        title: "API Connection Required",
        description: "Cannot edit suppliers without API connection.",
        variant: "destructive"
      });
      return;
    }
    setEditingSupplier(supplier);
    setSupplierName(supplier.name);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!supplierName.trim()) {
      toast({ title: "Please enter a supplier name", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, { name: supplierName.trim() });
        toast({ title: "Supplier updated successfully" });
      } else {
        await supplierService.createSupplier({ name: supplierName.trim() });
        toast({ title: "Supplier created successfully" });
      }
      
      setIsDialogOpen(false);
      setSupplierName('');
      setEditingSupplier(null);
      await fetchSuppliers();
    } catch (error) {
      toast({
        title: "Error saving supplier",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    if (apiError) {
      toast({
        title: "API Connection Required",
        description: "Cannot delete suppliers without API connection.",
        variant: "destructive"
      });
      return;
    }
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    
    setIsDeleting(true);
    try {
      await supplierService.deleteSupplier(supplierToDelete.id);
      toast({ title: "Supplier deleted successfully" });
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
      await fetchSuppliers();
    } catch (error) {
      toast({
        title: "Error deleting supplier",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetryConnection = () => {
    fetchSuppliers();
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
        <CardTitle className="text-lg">Supplier Management</CardTitle>
        <div className="flex items-center gap-2">
          {apiError && (
            <Button onClick={handleRetryConnection} variant="outline" size="sm">
              Retry Connection
            </Button>
          )}
          <Button onClick={handleCreate} size="sm" disabled={isLoading || !!apiError}>
            <Plus className="h-4 w-4 mr-1" />
            Add Supplier
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
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 focus-visible:ring-1"
              disabled={isLoading || !!apiError}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center my-4">
                  <Loader className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500 text-lg font-medium">Loading suppliers...</p>
                </div>
              </div>
            ) : apiError ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center my-4">
                  <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-500 text-lg font-medium">Unable to load suppliers</p>
                  <p className="text-red-400 text-sm mt-1">Check console for detailed error information</p>
                  <Button onClick={handleRetryConnection} variant="outline" size="sm" className="mt-3">
                    Try Again
                  </Button>
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
                    {debouncedSearch ? `No suppliers match "${debouncedSearch}"` : 'No suppliers available'}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (editingSupplier ? 'Update' : 'Create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this supplier? This action cannot be undone.
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

export default SupplierManagement;
