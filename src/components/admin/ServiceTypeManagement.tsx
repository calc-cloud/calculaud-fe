
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAdminData } from '@/contexts/AdminDataContext';

const ServiceTypeManagement = () => {
  const { serviceTypes, setServiceTypes } = useAdminData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState<any>(null);
  const [serviceTypeName, setServiceTypeName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();

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

  const handleDelete = (id: string) => {
    setServiceTypes(prev => prev.filter(st => st.id !== id));
    toast({ title: "Service type deleted successfully" });
  };

  // Filter service types based on search query
  const filteredServiceTypes = serviceTypes.filter(serviceType =>
    serviceType.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Service Type Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingServiceType ? 'Edit Service Type' : 'Create New Service Type'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceTypeName">Service Type Name</Label>
                <Input
                  id="serviceTypeName"
                  value={serviceTypeName}
                  onChange={(e) => setServiceTypeName(e.target.value)}
                  placeholder="Enter service type name"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingServiceType ? 'Update' : 'Create'}
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
              placeholder="Search service types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="space-y-2">
            {filteredServiceTypes.map((serviceType) => (
              <div key={serviceType.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{serviceType.name}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(serviceType)}>
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
                        <AlertDialogTitle>Delete Service Type</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this service type? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(serviceType.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceTypeManagement;
