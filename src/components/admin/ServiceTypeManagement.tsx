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
import { useAdminData } from '@/contexts/AdminDataContext';

const ServiceTypeManagement = () => {
  const { serviceTypes, setServiceTypes } = useAdminData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState<any>(null);
  const [serviceTypeName, setServiceTypeName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceTypeToDelete, setServiceTypeToDelete] = useState<any>(null);

  const { toast } = useToast();
  const itemsPerPage = 12;

  const handleCreate = () => {
    setEditingServiceType(null);
    setServiceTypeName('');
    setIsDialogOpen(true);
  };

  const handleEdit = (serviceType: any) => {
    setEditingServiceType(serviceType);
    setServiceTypeName(serviceType.name);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!serviceTypeName.trim()) {
      toast({ title: "Please enter a service type name", variant: "destructive" });
      return;
    }

    if (editingServiceType) {
      setServiceTypes(prev => prev.map(st => 
        st.id === editingServiceType.id 
          ? { ...st, name: serviceTypeName.trim() }
          : st
      ));
      toast({ title: "Service type updated successfully" });
    } else {
      const newServiceType = {
        id: Date.now().toString(),
        name: serviceTypeName.trim()
      };
      setServiceTypes(prev => [...prev, newServiceType]);
      toast({ title: "Service type created successfully" });
    }
    
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (serviceType: any) => {
    setServiceTypeToDelete(serviceType);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (serviceTypeToDelete) {
      setServiceTypes(prev => prev.filter(st => st.id !== serviceTypeToDelete.id));
      toast({ title: "Service type deleted successfully" });
      setDeleteDialogOpen(false);
      setServiceTypeToDelete(null);
    }
  };

  // Filter service types based on search query
  const filteredServiceTypes = serviceTypes.filter(serviceType =>
    serviceType.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredServiceTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServiceTypes = filteredServiceTypes.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
        <CardTitle className="text-lg">Service Type Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Service Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingServiceType ? 'Edit Service Type' : 'Create New Service Type'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="serviceTypeName" className="text-sm">Service Type Name</Label>
                <Input
                  id="serviceTypeName"
                  value={serviceTypeName}
                  onChange={(e) => setServiceTypeName(e.target.value)}
                  placeholder="Enter service type name"
                  className="h-8"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} size="sm">
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">
                  {editingServiceType ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="relative flex-shrink-0 mb-4">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              placeholder="Search service types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-6">
              {paginatedServiceTypes.map((serviceType) => (
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
          </div>

          <div className="flex-shrink-0 mt-2">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service type? This action cannot be undone.
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
  );
};

export default ServiceTypeManagement;
