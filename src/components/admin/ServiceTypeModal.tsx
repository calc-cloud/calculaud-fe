
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ServiceType } from '@/types/serviceTypes';

interface ServiceTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: ServiceType | null;
  onSave: (name: string, editId?: number) => Promise<void>;
}

const ServiceTypeModal: React.FC<ServiceTypeModalProps> = ({
  open,
  onOpenChange,
  editItem,
  onSave
}) => {
  const [serviceTypeName, setServiceTypeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editItem) {
      setServiceTypeName(editItem.name);
    } else {
      setServiceTypeName('');
    }
  }, [editItem]);

  const handleSave = async () => {
    if (!serviceTypeName.trim()) {
      toast({ title: "Please enter a service type name", variant: "destructive" });
      return;
    }

    if (serviceTypeName.length > 200) {
      toast({ title: "Service type name must be 200 characters or less", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(serviceTypeName.trim(), editItem?.id);
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
            {editItem ? 'Edit Service Type' : 'Create New Service Type'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="serviceTypeName" className="text-sm mb-2 block">
              Service Type Name
            </Label>
            <Input
              id="serviceTypeName"
              value={serviceTypeName}
              onChange={(e) => setServiceTypeName(e.target.value)}
              placeholder="Enter service type name"
              className="h-8"
              disabled={isLoading}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {serviceTypeName.length}/200 characters
            </p>
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

export default ServiceTypeModal;
