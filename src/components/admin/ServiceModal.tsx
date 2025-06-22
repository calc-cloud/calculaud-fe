
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Service } from '@/types/services';
import { useServiceTypes } from '@/hooks/useServiceTypes';

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Service | null;
  onSave: (name: string, serviceTypeId: number, editId?: number) => Promise<void>;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  open,
  onOpenChange,
  editItem,
  onSave
}) => {
  const [serviceName, setServiceName] = useState('');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { data: serviceTypesData } = useServiceTypes();

  useEffect(() => {
    if (editItem) {
      setServiceName(editItem.name);
      setSelectedServiceTypeId(editItem.service_type_id.toString());
    } else {
      setServiceName('');
      setSelectedServiceTypeId('');
    }
  }, [editItem]);

  const handleSave = async () => {
    if (!serviceName.trim()) {
      toast({ title: "Please enter a service name", variant: "destructive" });
      return;
    }

    if (!selectedServiceTypeId) {
      toast({ title: "Please select a service type", variant: "destructive" });
      return;
    }

    if (serviceName.length > 200) {
      toast({ title: "Service name must be 200 characters or less", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(serviceName.trim(), parseInt(selectedServiceTypeId), editItem?.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving service:', error);
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
            {editItem ? 'Edit Service' : 'Create New Service'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="serviceName" className="text-sm mb-2 block">
              Service Name
            </Label>
            <Input
              id="serviceName"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Enter service name"
              className="h-8"
              disabled={isLoading}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {serviceName.length}/200 characters
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

export default ServiceModal;
