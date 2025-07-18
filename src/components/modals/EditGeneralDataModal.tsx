import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Purpose, PurposeContent } from '@/types';

import { useAdminData } from '@/contexts/AdminDataContext';
import { useToast } from '@/hooks/use-toast';
import { HierarchySelector } from '@/components/common/HierarchySelector';
import { ContentsSection } from '@/components/sections/ContentsSection';
import { Supplier } from '@/types/suppliers';
import { ServiceType } from '@/types/serviceTypes';

interface EditGeneralDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  purpose: Purpose;
  onSave: (updatedPurpose: Purpose) => void;
}

interface GeneralDataForm {
  description: string;
  selectedSupplier: Supplier | null;
  selectedServiceType: ServiceType | null;
  expected_delivery: string;
  status: string;
  hierarchy_id: string;
  hierarchy_name: string;
  comments: string;
  contents: PurposeContent[];
}

export const EditGeneralDataModal: React.FC<EditGeneralDataModalProps> = ({
  isOpen,
  onClose,
  purpose,
  onSave
}) => {
  const { hierarchies, suppliers, serviceTypes, isLoading } = useAdminData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<GeneralDataForm>({
    description: '',
    selectedSupplier: null,
    selectedServiceType: null,
    expected_delivery: '',
    status: 'IN_PROGRESS',
    hierarchy_id: '',
    hierarchy_name: '',
    comments: '',
    contents: []
  });
  
  const [selectedHierarchyIds, setSelectedHierarchyIds] = useState<number[]>([]);

  // Initialize form data when purpose changes
  useEffect(() => {
    if (purpose && isOpen) {
      const selectedSupplier = suppliers.find(s => s.name === purpose.supplier) || null;
      const selectedServiceType = serviceTypes.find(st => st.name === purpose.service_type) || null;
      
      setFormData({
        description: purpose.description || '',
        selectedSupplier,
        selectedServiceType,
        expected_delivery: purpose.expected_delivery || '',
        status: purpose.status || 'IN_PROGRESS',
        hierarchy_id: purpose.hierarchy_id || '',
        hierarchy_name: purpose.hierarchy_name || '',
        comments: purpose.comments || '',
        contents: purpose.contents || []
      });

      // Set selected hierarchy for tree selector
      if (purpose.hierarchy_id) {
        setSelectedHierarchyIds([parseInt(purpose.hierarchy_id)]);
      } else {
        setSelectedHierarchyIds([]);
      }


    }
  }, [purpose, isOpen, suppliers, serviceTypes]);

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.description?.trim()) {
      errors.push('Description is required');
    }
    if (!formData.selectedSupplier) {
      errors.push('Supplier is required');
    }
    if (!formData.selectedServiceType) {
      errors.push('Service type is required');
    }
    if (!formData.contents || formData.contents.length === 0) {
      errors.push('At least one content item is required');
    } else {
      formData.contents.forEach((content, index) => {
        if (!content.material_id || content.material_id === 0) {
          errors.push(`Content ${index + 1}: Material is required`);
        }
        if (!content.quantity || content.quantity <= 0) {
          errors.push(`Content ${index + 1}: Quantity must be greater than 0`);
        }
      });
    }
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join('. '),
        variant: "destructive"
      });
      return;
    }

    // Create updated purpose with general data changes
    const updatedPurpose: Purpose = {
      ...purpose,
      description: formData.description.trim(),
      supplier: formData.selectedSupplier!.name,
      service_type: formData.selectedServiceType!.name as Purpose['service_type'],
      expected_delivery: formData.expected_delivery,
      status: formData.status as Purpose['status'],
      hierarchy_id: formData.hierarchy_id,
      hierarchy_name: formData.hierarchy_name,
      comments: formData.comments.trim() || undefined,
      contents: formData.contents
    };

    onSave(updatedPurpose);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleFieldChange = <K extends keyof GeneralDataForm>(field: K, value: GeneralDataForm[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === parseInt(supplierId));
    setFormData(prev => ({ ...prev, selectedSupplier: supplier || null }));
  };

  const handleServiceTypeChange = (serviceTypeId: string) => {
    const serviceType = serviceTypes.find(st => st.id === parseInt(serviceTypeId));
    setFormData(prev => ({ 
      ...prev, 
      selectedServiceType: serviceType || null,
      // Reset contents when service type changes since materials will be different
      contents: []
    }));
  };

  const handleHierarchyChange = (selectedIds: number[]) => {
    setSelectedHierarchyIds(selectedIds);
    
    if (selectedIds.length > 0) {
      const selectedHierarchy = hierarchies.find(h => h.id === selectedIds[0]);
      if (selectedHierarchy) {
        setFormData(prev => ({
          ...prev,
          hierarchy_id: selectedHierarchy.id.toString(),
          hierarchy_name: selectedHierarchy.name
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        hierarchy_id: '',
        hierarchy_name: ''
      }));
    }
  };



  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit General Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Enter purpose description..."
              rows={3}
            />
          </div>

          {/* Supplier and Service Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select
                value={formData.selectedSupplier?.id.toString() || ''}
                onValueChange={handleSupplierChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-type">Service Type *</Label>
              <Select
                value={formData.selectedServiceType?.id.toString() || ''}
                onValueChange={handleServiceTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((serviceType) => (
                    <SelectItem key={serviceType.id} value={serviceType.id.toString()}>
                      {serviceType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expected Delivery and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expected-delivery">Expected Delivery</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expected_delivery && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {formData.expected_delivery 
                        ? format(new Date(formData.expected_delivery), "dd/MM/yyyy") 
                        : "Select delivery date"
                      }
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.expected_delivery ? new Date(formData.expected_delivery) : undefined}
                    onSelect={(date) => handleFieldChange('expected_delivery', date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleFieldChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['IN_PROGRESS', 'COMPLETED'].map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusDisplay(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hierarchy */}
          <div className="space-y-2">
            <Label htmlFor="hierarchy">Hierarchy</Label>
            <HierarchySelector
              hierarchies={hierarchies}
              selectedIds={selectedHierarchyIds}
              onSelectionChange={handleHierarchyChange}
              singleSelect={true}
            />
          </div>

          {/* Status Message */}
          <div className="space-y-2">
            <Label htmlFor="comments">Status Message</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => handleFieldChange('comments', e.target.value)}
              placeholder="Enter status message..."
              rows={2}
            />
          </div>

          {/* Contents */}
          <ContentsSection
            contents={formData.contents}
            onContentsChange={(contents) => handleFieldChange('contents', contents)}
            selectedServiceTypeId={formData.selectedServiceType?.id}
            showServiceTypeWarning={!formData.selectedServiceType}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 