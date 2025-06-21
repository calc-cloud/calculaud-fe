
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SupplierItem {
  id: string;
  name: string;
}

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([
    { id: '1', name: 'TechCorp Solutions' },
    { id: '2', name: 'Hardware Plus Inc' },
    { id: '3', name: 'Strategic Advisors LLC' },
    { id: '4', name: 'Global Tech Services' },
    { id: '5', name: 'Innovation Partners' },
    { id: '6', name: 'Digital Solutions Co' },
    { id: '7', name: 'Enterprise Systems Ltd' },
    { id: '8', name: 'CloudTech Inc' }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [supplierName, setSupplierName] = useState('');

  const { toast } = useToast();

  const handleCreate = () => {
    setEditingSupplier(null);
    setSupplierName('');
    setIsDialogOpen(true);
  };

  const handleEdit = (supplier: SupplierItem) => {
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
      setSuppliers(prev => prev.map(s => 
        s.id === editingSupplier.id 
          ? { ...s, name: supplierName.trim() }
          : s
      ));
      toast({ title: "Supplier updated successfully" });
    } else {
      const newSupplier: SupplierItem = {
        id: Date.now().toString(),
        name: supplierName.trim()
      };
      setSuppliers(prev => [...prev, newSupplier]);
      toast({ title: "Supplier created successfully" });
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast({ title: "Supplier deleted successfully" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Supplier Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Edit Supplier' : 'Create New Supplier'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Enter supplier name"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingSupplier ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{supplier.name}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this supplier? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(supplier.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierManagement;
