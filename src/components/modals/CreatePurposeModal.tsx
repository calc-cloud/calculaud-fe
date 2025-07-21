
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { HierarchySelector } from '@/components/common/HierarchySelector';
import { ContentsSection } from '@/components/sections/ContentsSection';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminData } from '@/contexts/AdminDataContext';
import { useToast } from '@/hooks/use-toast';
import { usePurposeMutations } from '@/hooks/usePurposeMutations';
import { PurposeContent } from '@/types';
import { ServiceType } from '@/types/serviceTypes';

interface CreatePurposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateFormData {
  description: string;
  supplier_id: string;
  selectedServiceType: ServiceType | null;
  contents: PurposeContent[];
  hierarchy_id: string;
  hierarchy_name: string;
}

export const CreatePurposeModal: React.FC<CreatePurposeModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const { suppliers, serviceTypes, hierarchies } = useAdminData();
  const { toast } = useToast();
  const { createPurpose } = usePurposeMutations();
  
  const [formData, setFormData] = useState<CreateFormData>({
    description: '',
    supplier_id: '',
    selectedServiceType: null,
    contents: [],
    hierarchy_id: '',
    hierarchy_name: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHierarchyIds, setSelectedHierarchyIds] = useState<number[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        description: '',
        supplier_id: '',
        selectedServiceType: null,
        contents: [],
        hierarchy_id: '',
        hierarchy_name: ''
      });
      setSelectedHierarchyIds([]);
    }
  }, [isOpen]);

  const handleFieldChange = <K extends keyof CreateFormData>(field: K, value: CreateFormData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentsChange = (contents: PurposeContent[]) => {
    setFormData(prev => ({
      ...prev,
      contents
    }));
  };

  const handleHierarchyChange = (selectedIds: number[]) => {
    // Enforce single selection - only keep the most recently selected item
    const newSelectedIds = selectedIds.length > 0 ? [selectedIds[selectedIds.length - 1]] : [];
    setSelectedHierarchyIds(newSelectedIds);
    
    if (newSelectedIds.length > 0) {
      const selectedHierarchy = hierarchies.find(h => h.id === newSelectedIds[0]);
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

  const handleServiceTypeChange = (serviceTypeId: string) => {
    const serviceType = serviceTypes.find(st => st.id === parseInt(serviceTypeId));
    setFormData(prev => ({
      ...prev,
      selectedServiceType: serviceType || null,
      // Reset contents when service type changes since materials will be different
      contents: []
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.description?.trim()) {
      errors.push('Description is required');
    }
    
    if (!formData.supplier_id) {
      errors.push('Supplier is required');
    }
    
    if (!formData.selectedServiceType) {
      errors.push('Service type is required');
    }
    
    if (!formData.hierarchy_id) {
      errors.push('Hierarchy is required');
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

  const isFormValid = () => {
    // Check all required fields are filled
    const hasDescription = !!formData.description?.trim();
    const hasSupplier = !!formData.supplier_id;
    const hasServiceType = !!formData.selectedServiceType;
    const hasHierarchy = !!formData.hierarchy_id;
    const hasContents = formData.contents && formData.contents.length > 0;
    
    // Check that all content items are valid
    const areContentsValid = hasContents && formData.contents.every(content => 
      content.material_id && content.material_id > 0 && content.quantity && content.quantity > 0
    );
    
    return hasDescription && hasSupplier && hasServiceType && hasHierarchy && areContentsValid;
  };

  const handleCreate = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join('. '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare the purpose data
      const purposeData = {
        description: formData.description.trim(),
        supplier_id: formData.supplier_id,
        service_type_id: formData.selectedServiceType?.id.toString(),
        contents: formData.contents.map(content => ({
          material_id: content.material_id,
          quantity: content.quantity
        })),
        hierarchy_id: formData.hierarchy_id || undefined,
        hierarchy_name: formData.hierarchy_name || undefined,
        status: 'IN_PROGRESS' as const
      };

      // Create the purpose (this would be the actual API call)
      // For now, we'll simulate it
      const newPurpose = await createPurpose.mutateAsync(purposeData);
      
      toast({
        title: "Purpose created",
        description: "Your new purpose has been created successfully.",
      });

      // Close modal and navigate to the new purpose page
      onClose();
      navigate(`/purposes/${newPurpose.id}`);
      
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to create purpose. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Purpose</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter purpose description..."
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Hierarchy */}
          <div className="space-y-2">
            <Label htmlFor="hierarchy">Hierarchy *</Label>
            <HierarchySelector
              hierarchies={hierarchies}
              selectedIds={selectedHierarchyIds}
              onSelectionChange={handleHierarchyChange}
              singleSelect
            />
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier *</Label>
            <Select
              value={formData.supplier_id}
              onValueChange={(value) => handleFieldChange('supplier_id', value)}
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

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type *</Label>
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

          {/* Contents */}
          <ContentsSection
            contents={formData.contents}
            onContentsChange={handleContentsChange}
            selectedServiceTypeId={formData.selectedServiceType?.id}
            showServiceTypeWarning={!formData.selectedServiceType}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? 'Creating...' : 'Create Purpose'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 