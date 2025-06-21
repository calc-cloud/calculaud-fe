import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Purpose, ModalMode } from '@/types';
import { PURPOSE_STATUSES } from '@/utils/constants';
import { EMFSection } from '../sections/EMFSection';
import { FileUpload } from '../common/FileUpload';
import { formatDate } from '@/utils/dateUtils';
import { useHierarchies } from '@/hooks/useHierarchies';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useToast } from '@/hooks/use-toast';

interface PurposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  purpose?: Purpose;
  onSave?: (purpose: Partial<Purpose>) => void;
  onEdit?: (purpose: Purpose) => void;
  onDelete?: (purposeId: string) => void;
}

export const PurposeModal: React.FC<PurposeModalProps> = ({
  isOpen,
  onClose,
  mode,
  purpose,
  onSave,
  onEdit,
  onDelete
}) => {
  const { data: hierarchiesData, isLoading: hierarchiesLoading } = useHierarchies();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: serviceTypesData, isLoading: serviceTypesLoading } = useServiceTypes();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Purpose>>({
    description: '',
    content: '',
    supplier: '',
    hierarchy_id: '',
    hierarchy_name: '',
    status: 'PENDING',
    expected_delivery: '',
    comments: '',
    service_type: 'Other',
    emfs: [],
    files: []
  });
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date>();

  const isReadOnly = mode === 'view';
  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';

  // Get backend data arrays
  const hierarchies = hierarchiesData?.items || [];
  const suppliers = suppliersData?.items || [];
  const serviceTypes = serviceTypesData?.items || [];

  // Initialize form data when purpose changes
  useEffect(() => {
    if (purpose) {
      setFormData(purpose);
      if (purpose.expected_delivery) {
        setExpectedDeliveryDate(new Date(purpose.expected_delivery));
      }
    } else {
      setFormData({
        description: '',
        content: '',
        supplier: '',
        hierarchy_id: '',
        hierarchy_name: '',
        status: 'PENDING',
        expected_delivery: '',
        comments: '',
        service_type: 'Other',
        emfs: [],
        files: []
      });
      setExpectedDeliveryDate(undefined);
    }
  }, [purpose, isOpen]);

  const validatePurpose = () => {
    const errors: string[] = [];

    if (!formData.description?.trim()) {
      errors.push('Description is required');
    }
    if (!formData.supplier?.trim()) {
      errors.push('Supplier is required');
    }
    if (!formData.content?.trim()) {
      errors.push('Content is required');
    }
    if (!formData.service_type) {
      errors.push('Service type is required');
    }

    return errors;
  };

  const validateEMFs = () => {
    const errors: string[] = [];

    if (formData.emfs && formData.emfs.length > 0) {
      formData.emfs.forEach((emf, index) => {
        if (!emf.id?.trim()) {
          errors.push(`EMF ${index + 1}: EMF ID is required`);
        }
        if (!emf.creation_date) {
          errors.push(`EMF ${index + 1}: Creation date is required`);
        }
        if (!emf.costs || emf.costs.length === 0) {
          errors.push(`EMF ${index + 1}: At least one cost is required`);
        }
      });
    }

    return errors;
  };

  const handleSave = () => {
    console.log('HandleSave called with formData:', formData);
    console.log('Available data - suppliers:', suppliers.length, 'hierarchies:', hierarchies.length, 'serviceTypes:', serviceTypes.length);
    
    const purposeErrors = validatePurpose();
    const emfErrors = validateEMFs();
    const allErrors = [...purposeErrors, ...emfErrors];

    if (allErrors.length > 0) {
      console.log('Validation errors:', allErrors);
      toast({
        title: "Validation Error",
        description: allErrors.join('. '),
        variant: "destructive"
      });
      return;
    }

    if (onSave) {
      const purposeData = {
        ...formData,
        expected_delivery: expectedDeliveryDate ? expectedDeliveryDate.toISOString().split('T')[0] : ''
      };
      console.log('Calling onSave with purposeData:', purposeData);
      onSave(purposeData);
    } else {
      console.log('onSave is not defined');
    }
    onClose();
  };

  const handleFieldChange = (field: keyof Purpose, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSupplierChange = (supplierName: string) => {
    handleFieldChange('supplier', supplierName);
  };

  const handleHierarchyChange = (hierarchyName: string) => {
    handleFieldChange('hierarchy_name', hierarchyName);
    // Also set hierarchy_id for API mapping
    const hierarchy = hierarchies.find(h => h.name === hierarchyName);
    if (hierarchy) {
      handleFieldChange('hierarchy_id', hierarchy.id.toString());
    }
  };

  const handleServiceTypeChange = (serviceTypeName: string) => {
    handleFieldChange('service_type', serviceTypeName);
  };

  const handleDelete = () => {
    if (purpose && onDelete) {
      onDelete(purpose.id);
      onClose();
    }
  };

  const handleEdit = () => {
    if (purpose && onEdit) {
      onEdit(purpose);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'PENDING':
        return 'Pending';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const modalTitle = isCreating ? 'Create Purpose' : isEditing ? 'Edit Purpose' : 'Purpose Details';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="text-lg font-semibold">{modalTitle}</DialogTitle>
          {mode === 'view' && purpose && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="h-8 px-3"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the purpose
                      "{purpose.description}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </DialogHeader>

        {/* Metadata Section - only show in view mode */}
        {mode === 'view' && purpose && (
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground font-medium">Last Modified</Label>
                <p className="mt-1">{formatDate(purpose.last_modified)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground font-medium">Created</Label>
                <p className="mt-1">{formatDate(purpose.creation_time)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                disabled={isReadOnly}
                placeholder="Enter purpose description"
                className={!formData.description?.trim() && !isReadOnly ? 'border-red-300' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier <span className="text-red-500">*</span></Label>
              {isReadOnly ? (
                <Input
                  id="supplier"
                  value={formData.supplier || ''}
                  disabled={true}
                />
              ) : (
                <Select
                  value={formData.supplier || ''}
                  onValueChange={handleSupplierChange}
                  disabled={suppliersLoading}
                >
                  <SelectTrigger className={!formData.supplier && !isReadOnly ? 'border-red-300' : ''}>
                    <SelectValue placeholder={suppliersLoading ? "Loading suppliers..." : "Select supplier"} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
            <Textarea
              id="content"
              value={formData.content || ''}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              placeholder="Describe the purpose content in detail..."
              className={!formData.content?.trim() && !isReadOnly ? 'border-red-300' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hierarchy_name">Hierarchy</Label>
            {isReadOnly ? (
              <Input
                id="hierarchy_name"
                value={formData.hierarchy_name || ''}
                disabled={true}
              />
            ) : (
              <Select
                value={formData.hierarchy_name || ''}
                onValueChange={handleHierarchyChange}
                disabled={hierarchiesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={hierarchiesLoading ? "Loading hierarchies..." : "Select hierarchy"} />
                </SelectTrigger>
                <SelectContent>
                  {hierarchies.map((hierarchy) => (
                    <SelectItem key={hierarchy.id} value={hierarchy.name}>
                      {hierarchy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type <span className="text-red-500">*</span></Label>
              <Select
                value={formData.service_type}
                onValueChange={handleServiceTypeChange}
                disabled={isReadOnly || serviceTypesLoading}
              >
                <SelectTrigger className={!formData.service_type && !isReadOnly ? 'border-red-300' : ''}>
                  <SelectValue placeholder={serviceTypesLoading ? "Loading service types..." : "Select service type"} />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleFieldChange('status', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <Badge variant={status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {getStatusDisplay(status)}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expected Delivery</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expectedDeliveryDate && "text-muted-foreground"
                  )}
                  disabled={isReadOnly}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedDeliveryDate ? format(expectedDeliveryDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expectedDeliveryDate}
                  onSelect={setExpectedDeliveryDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments || ''}
              onChange={(e) => handleFieldChange('comments', e.target.value)}
              disabled={isReadOnly}
              rows={2}
              placeholder="Add any additional comments..."
            />
          </div>

          {/* EMF Section */}
          <EMFSection
            emfs={formData.emfs || []}
            onEMFsChange={(emfs) => handleFieldChange('emfs', emfs)}
            isReadOnly={isReadOnly}
          />

          {/* File Upload Section */}
          <FileUpload
            files={formData.files || []}
            onFilesChange={(files) => handleFieldChange('files', files)}
            isReadOnly={isReadOnly}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave}>
              {isCreating ? 'Create Purpose' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
