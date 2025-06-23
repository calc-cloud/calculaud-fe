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
import { CalendarIcon, Edit, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Purpose, ModalMode, PurposeContent } from '@/types';
import { PURPOSE_STATUSES } from '@/utils/constants';
import { EMFSection } from '../sections/EMFSection';
import { ContentsSection } from '../sections/ContentsSection';
import { FileUpload } from '../common/FileUpload';
import { formatDate } from '@/utils/dateUtils';
import { useHierarchies } from '@/hooks/useHierarchies';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useToast } from '@/hooks/use-toast';
import { HierarchySelector } from '@/components/common/HierarchySelector';
import { Supplier } from '@/types/suppliers';
import { ServiceType } from '@/types/serviceTypes';
import { Hierarchy } from '@/types/hierarchies';

interface PurposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  purpose?: Purpose;
  onSave?: (purpose: Partial<Purpose>) => void;
  onEdit?: (purpose: Purpose) => void;
  onDelete?: (purposeId: string) => void;
  onModeChange?: (newMode: ModalMode) => void; // Add prop for mode changes
}

// Extended form data interface to store full objects
interface ExtendedFormData extends Omit<Partial<Purpose>, 'supplier' | 'service_type' | 'contents'> {
  selectedSupplier?: Supplier | null;
  selectedServiceType?: ServiceType | null;
  contents?: PurposeContent[];
  // Keep original fields for backward compatibility
  supplier?: string;
  service_type?: string;
}
export const PurposeModal: React.FC<PurposeModalProps> = ({
  isOpen,
  onClose,
  mode,
  purpose,
  onSave,
  onEdit,
  onDelete,
  onModeChange
}) => {
  const {
    data: hierarchiesData,
    isLoading: hierarchiesLoading
  } = useHierarchies();
  const {
    data: suppliersData,
    isLoading: suppliersLoading
  } = useSuppliers();
  const {
    data: serviceTypesData,
    isLoading: serviceTypesLoading
  } = useServiceTypes();
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState<ExtendedFormData>({
    description: '',
    contents: [],
    selectedSupplier: null,
    selectedServiceType: null,
    hierarchy_id: '',
    hierarchy_name: '',
    status: 'IN_PROGRESS',
    expected_delivery: '',
    comments: '',
    emfs: [],
    files: []
  });
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date>();
  const [selectedHierarchyIds, setSelectedHierarchyIds] = useState<string[]>([]);
  const isReadOnly = mode === 'view';
  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';

  // Get backend data arrays
  const hierarchies = hierarchiesData?.items || [];
  const suppliers = suppliersData?.items || [];
  const serviceTypes = serviceTypesData?.items || [];

  // Transform hierarchies for HierarchySelector
  const transformedHierarchies = hierarchies.map((hierarchy: Hierarchy) => ({
    id: hierarchy.id.toString(),
    type: hierarchy.type as 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team',
    name: hierarchy.name,
    parentId: hierarchy.parent_id?.toString(),
    fullPath: hierarchy.path
  }));

  // Initialize form data when purpose changes
  useEffect(() => {
    if (purpose) {
      // Find full objects based on purpose data
      const selectedSupplier = suppliers.find(s => s.name === purpose.supplier) || null;
      const selectedServiceType = serviceTypes.find(st => st.name === purpose.service_type) || null;
      setFormData({
        ...purpose,
        selectedSupplier,
        selectedServiceType,
        contents: purpose.contents || []
      });

      // Set selected hierarchy for tree selector
      if (purpose.hierarchy_id) {
        setSelectedHierarchyIds([purpose.hierarchy_id]);
      } else {
        setSelectedHierarchyIds([]);
      }
      if (purpose.expected_delivery) {
        setExpectedDeliveryDate(new Date(purpose.expected_delivery));
      }
    } else {
      setFormData({
        description: '',
        contents: [],
        selectedSupplier: null,
        selectedServiceType: null,
        hierarchy_id: '',
        hierarchy_name: '',
        status: 'IN_PROGRESS',
        expected_delivery: '',
        comments: '',
        emfs: [],
        files: []
      });
      setSelectedHierarchyIds([]);
      setExpectedDeliveryDate(undefined);
    }
  }, [purpose, isOpen, suppliers, serviceTypes]);
  const validatePurpose = () => {
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
    console.log('=== PurposeModal.handleSave START ===');
    console.log('Mode:', mode);
    console.log('FormData:', formData);
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
    console.log('Validation passed, preparing purpose data...');

    // Prepare purpose data with IDs directly from selected objects
    const purposeData: any = {};

    // Required fields - always include
    if (formData.description?.trim()) {
      purposeData.description = formData.description.trim();
    }
    if (formData.selectedSupplier) {
      purposeData.supplier_id = formData.selectedSupplier.id;
      purposeData.supplier = formData.selectedSupplier.name; // Keep for display
    }
    if (formData.contents && formData.contents.length > 0) {
      purposeData.contents = formData.contents;
    }
    if (formData.selectedServiceType) {
      purposeData.service_type_id = formData.selectedServiceType.id;
      purposeData.service_type = formData.selectedServiceType.name; // Keep for display
    }

    // Optional fields - only include if they have values
    if (formData.hierarchy_name?.trim()) {
      purposeData.hierarchy_name = formData.hierarchy_name.trim();
      purposeData.hierarchy_id = formData.hierarchy_id;
    }
    if (formData.status && formData.status !== 'IN_PROGRESS') {
      purposeData.status = formData.status;
    } else if (!formData.status) {
      purposeData.status = 'IN_PROGRESS';
    }
    if (expectedDeliveryDate) {
      purposeData.expected_delivery = expectedDeliveryDate.toISOString().split('T')[0];
    }
    if (formData.comments?.trim()) {
      purposeData.comments = formData.comments.trim();
    }
    if (formData.emfs && formData.emfs.length > 0) {
      purposeData.emfs = formData.emfs;
    }
    if (formData.files && formData.files.length > 0) {
      purposeData.files = formData.files;
    }
    console.log('Final purposeData to be sent:', purposeData);
    if (onSave) {
      console.log('Calling onSave with purposeData...');
      onSave(purposeData);
      console.log('onSave called successfully');
    } else {
      console.error('ERROR: onSave function is not provided!');
      toast({
        title: "Configuration Error",
        description: "Save function is not properly configured",
        variant: "destructive"
      });
      return;
    }
    console.log('Closing modal...');
    onClose();
    console.log('=== PurposeModal.handleSave END ===');
  };
  const handleFieldChange = (field: keyof ExtendedFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSupplierChange = (supplierId: string) => {
    const selectedSupplier = suppliers.find(s => s.id.toString() === supplierId) || null;
    setFormData(prev => ({
      ...prev,
      selectedSupplier,
      supplier: selectedSupplier?.name || ''
    }));
  };
  const handleHierarchyChange = (selectedIds: string[]) => {
    // Only allow single selection - take the first selected item
    const singleSelection = selectedIds.length > 0 ? [selectedIds[selectedIds.length - 1]] : [];
    setSelectedHierarchyIds(singleSelection);
    if (singleSelection.length > 0) {
      const selectedHierarchy = hierarchies.find(h => h.id.toString() === singleSelection[0]);
      if (selectedHierarchy) {
        setFormData(prev => ({
          ...prev,
          hierarchy_id: selectedHierarchy.id.toString(),
          hierarchy_name: selectedHierarchy.path
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
    const selectedServiceType = serviceTypes.find(st => st.id.toString() === serviceTypeId) || null;
    
    // Clear contents when service type changes to prevent invalid service selections
    const shouldClearContents = formData.selectedServiceType?.id !== selectedServiceType?.id && formData.contents && formData.contents.length > 0;
    
    setFormData(prev => ({
      ...prev,
      selectedServiceType,
      service_type: selectedServiceType?.name || '',
      contents: shouldClearContents ? [] : prev.contents
    }));
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
  const handleCancel = () => {
    if (mode === 'edit' && onModeChange) {
      // When editing, switch back to view mode instead of closing
      onModeChange('view');
    } else {
      // For create mode or when onModeChange is not provided, close the modal
      onClose();
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
  const modalTitle = isCreating ? 'Create Purpose' : isEditing ? 'Edit Purpose' : 'Purpose Details';
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="text-lg font-semibold">{modalTitle}</DialogTitle>
          {mode === 'view' && purpose && <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit} className="h-8 px-3">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50">
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
            </div>}
        </DialogHeader>

        {/* Metadata Section - only show in view mode */}
        {mode === 'view' && purpose && <div className="bg-muted/30 rounded-lg p-4 mb-6">
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
          </div>}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Input id="description" value={formData.description || ''} onChange={e => handleFieldChange('description', e.target.value)} disabled={isReadOnly} placeholder="Enter purpose description" className={!formData.description?.trim() && !isReadOnly ? 'border-red-300' : ''} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier <span className="text-red-500">*</span></Label>
              {isReadOnly ? <Input id="supplier" value={formData.selectedSupplier?.name || formData.supplier || ''} disabled={true} /> : <Select value={formData.selectedSupplier?.id.toString() || ''} onValueChange={handleSupplierChange} disabled={suppliersLoading}>
                  <SelectTrigger className={!formData.selectedSupplier && !isReadOnly ? 'border-red-300' : ''}>
                    <SelectValue placeholder={suppliersLoading ? "Loading suppliers..." : "Select supplier"} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type <span className="text-red-500">*</span></Label>
            <Select value={formData.selectedServiceType?.id.toString() || ''} onValueChange={handleServiceTypeChange} disabled={isReadOnly || serviceTypesLoading}>
              <SelectTrigger className={!formData.selectedServiceType && !isReadOnly ? 'border-red-300' : ''}>
                <SelectValue placeholder={serviceTypesLoading ? "Loading service types..." : "Select service type"} />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map(type => <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Contents Section - Now requires service type to be selected */}
          <ContentsSection
            contents={formData.contents || []}
            onContentsChange={(contents) => handleFieldChange('contents', contents)}
            isReadOnly={isReadOnly}
            selectedServiceTypeId={formData.selectedServiceType?.id}
            showServiceTypeWarning={!isReadOnly && !formData.selectedServiceType}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hierarchy_name">Hierarchy</Label>
              {isReadOnly ? <Input id="hierarchy_name" value={formData.hierarchy_name || ''} disabled={true} /> : <div className="space-y-1">
                  <HierarchySelector hierarchies={transformedHierarchies} selectedIds={selectedHierarchyIds} onSelectionChange={handleHierarchyChange} />
                  <p className="text-xs text-muted-foreground">
                    Select only one organizational unit
                  </p>
                </div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={value => handleFieldChange('status', value)} disabled={isReadOnly}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSE_STATUSES.map(status => <SelectItem key={status} value={status}>
                      <Badge variant={status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {getStatusDisplay(status)}
                      </Badge>
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" value={formData.comments || ''} onChange={e => handleFieldChange('comments', e.target.value)} disabled={isReadOnly} rows={2} placeholder="Add any additional comments..." />
          </div>

          {/* EMF Section with Hebrew Title */}
          <div className="space-y-1">
            <div className={`flex items-center ${!isReadOnly ? 'justify-between' : 'justify-end'}`}>
              {!isReadOnly && <Button onClick={() => {
              const newEMF: any = {
                id: '',
                purpose_id: '',
                creation_date: new Date().toISOString().split('T')[0],
                costs: []
              };
              handleFieldChange('emfs', [...(formData.emfs || []), newEMF]);
            }} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף רכש
                </Button>}
              <div className="text-right">
                <h3 className="text-lg font-semibold">רכישות</h3>
              </div>
            </div>
            <EMFSection emfs={formData.emfs || []} onEMFsChange={emfs => handleFieldChange('emfs', emfs)} isReadOnly={isReadOnly} hideAddButton={true} />
          </div>

          {/* Expected Delivery - moved to bottom above Attachments */}
          <div className="space-y-2">
            <Label>Expected Delivery</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expectedDeliveryDate && "text-muted-foreground")} disabled={isReadOnly}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedDeliveryDate ? format(expectedDeliveryDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={expectedDeliveryDate} onSelect={setExpectedDeliveryDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          {/* File Upload Section */}
          <FileUpload files={formData.files || []} onFilesChange={files => handleFieldChange('files', files)} isReadOnly={isReadOnly} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave}>
              {isCreating ? 'Create Purpose' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
