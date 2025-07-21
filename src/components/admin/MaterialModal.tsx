import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { Material } from '@/types/materials';

interface MaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Material | null;
  onSave: (name: string, serviceTypeId: number, editId?: number) => Promise<void>;
}

const MaterialModal: React.FC<MaterialModalProps> = ({
  open,
  onOpenChange,
  editItem,
  onSave
}) => {
  const [materialName, setMaterialName] = useState('');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { data: serviceTypesData } = useServiceTypes();

  useEffect(() => {
    if (editItem) {
      setMaterialName(editItem.name);
      setSelectedServiceTypeId(editItem.service_type_id.toString());
    } else {
      setMaterialName('');
      setSelectedServiceTypeId('');
    }
  }, [editItem]);

  const handleSave = async () => {
    if (!materialName.trim()) {
      toast({ title: "Please enter a material name", variant: "destructive" });
      return;
    }

    if (!selectedServiceTypeId) {
      toast({ title: "Please select a service type", variant: "destructive" });
      return;
    }

    if (materialName.length > 200) {
      toast({ title: "Material name must be 200 characters or less", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(materialName.trim(), parseInt(selectedServiceTypeId), editItem?.id);
      onOpenChange(false);
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editItem ? 'Edit Material' : 'Create New Material'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="materialName" className="text-sm mb-2 block">
              Material Name
            </Label>
            <Input
              id="materialName"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="Enter material name"
              className="h-8"
              disabled={isLoading}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {materialName.length}/200 characters
            </p>
          </div>
          
          <div>
            <Label htmlFor="serviceType" className="text-sm mb-2 block">
              Service Type
            </Label>
            <Select 
              value={selectedServiceTypeId} 
              onValueChange={setSelectedServiceTypeId}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select a service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypesData?.items?.map((serviceType) => (
                  <SelectItem key={serviceType.id} value={serviceType.id.toString()}>
                    {serviceType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              size="sm"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (editItem ? 'Update' : 'Create')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialModal;
