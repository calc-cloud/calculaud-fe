
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
import { SERVICE_TYPES, PURPOSE_STATUSES } from '@/utils/constants';
import { EMFSection } from '../sections/EMFSection';
import { FileUpload } from '../common/FileUpload';
import { formatDate } from '@/utils/dateUtils';

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
  const [formData, setFormData] = useState<Partial<Purpose>>({
    description: '',
    content: '',
    supplier: '',
    hierarchy_id: '',
    hierarchy_name: '',
    status: 'Pending',
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
        status: 'Pending',
        expected_delivery: '',
        comments: '',
        service_type: 'Other',
        emfs: [],
        files: []
      });
      setExpectedDeliveryDate(undefined);
    }
  }, [purpose, isOpen]);

  const handleSave = () => {
    if (onSave) {
      const purposeData = {
        ...formData,
        expected_delivery: expectedDeliveryDate ? expectedDeliveryDate.toISOString().split('T')[0] : ''
      };
      onSave(purposeData);
    }
    onClose();
  };

  const handleFieldChange = (field: keyof Purpose, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                disabled={isReadOnly}
                placeholder="Enter purpose description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier || ''}
                onChange={(e) => handleFieldChange('supplier', e.target.value)}
                disabled={isReadOnly}
                placeholder="Enter supplier name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content || ''}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              placeholder="Describe the purpose content in detail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hierarchy_id">Hierarchy ID</Label>
              <Input
                id="hierarchy_id"
                value={formData.hierarchy_id || ''}
                onChange={(e) => handleFieldChange('hierarchy_id', e.target.value)}
                disabled={isReadOnly}
                placeholder="Enter hierarchy ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hierarchy_name">Hierarchy Name</Label>
              <Input
                id="hierarchy_name"
                value={formData.hierarchy_name || ''}
                onChange={(e) => handleFieldChange('hierarchy_name', e.target.value)}
                disabled={isReadOnly}
                placeholder="Enter hierarchy name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => handleFieldChange('service_type', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
                      <Badge variant={status === 'Completed' ? 'default' : 'secondary'}>
                        {status}
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
