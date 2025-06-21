
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Purpose, ModalMode } from '@/types';
import { SERVICE_TYPES, PURPOSE_STATUSES, CURRENCIES } from '@/utils/constants';

interface PurposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  purpose?: Purpose;
  onSave?: (purpose: Partial<Purpose>) => void;
}

export const PurposeModal: React.FC<PurposeModalProps> = ({
  isOpen,
  onClose,
  mode,
  purpose,
  onSave
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
    currency: 'USD',
    emfs: [],
    files: []
  });
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date>();

  const isReadOnly = mode === 'view';
  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';

  // Reset form data when purpose or mode changes
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
        currency: 'USD',
        emfs: [],
        files: []
      });
      setExpectedDeliveryDate(undefined);
    }
  }, [purpose, mode]);

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

  const modalTitle = isCreating ? 'יצירת תכלית חדשה' : isEditing ? 'עריכת תכלית' : 'פרטי תכלית';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isReadOnly}
                placeholder="הכנס תיאור התכלית"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">ספק</Label>
              <Input
                id="supplier"
                value={formData.supplier || ''}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                disabled={isReadOnly}
                placeholder="שם הספק"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">תוכן</Label>
            <Textarea
              id="content"
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              disabled={isReadOnly}
              rows={3}
              placeholder="תיאור מפורט של התכלית"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hierarchy_id">מזהה היררכיה</Label>
              <Input
                id="hierarchy_id"
                value={formData.hierarchy_id || ''}
                onChange={(e) => setFormData({ ...formData, hierarchy_id: e.target.value })}
                disabled={isReadOnly}
                placeholder="H001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hierarchy_name">שם היררכיה</Label>
              <Input
                id="hierarchy_name"
                value={formData.hierarchy_name || ''}
                onChange={(e) => setFormData({ ...formData, hierarchy_name: e.target.value })}
                disabled={isReadOnly}
                placeholder="מחלקת IT"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_type">סוג שירות</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({ ...formData, service_type: value as any })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="status">סטטוס</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div className="space-y-2">
              <Label htmlFor="currency">מטבע</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>תאריך אספקה צפוי</Label>
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
                  {expectedDeliveryDate ? format(expectedDeliveryDate, "PPP") : "בחר תאריך"}
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
            <Label htmlFor="comments">הערות</Label>
            <Textarea
              id="comments"
              value={formData.comments || ''}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              disabled={isReadOnly}
              rows={2}
              placeholder="הערות נוספות"
            />
          </div>

          {/* Show EMFs and files count in view mode */}
          {isReadOnly && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label>מספר EMFs</Label>
                <p className="text-lg font-semibold">{formData.emfs?.length || 0}</p>
              </div>
              <div>
                <Label>מספר קבצים</Label>
                <p className="text-lg font-semibold">{formData.files?.length || 0}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isReadOnly ? 'סגור' : 'ביטול'}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave}>
              {isCreating ? 'צור תכלית' : 'שמור שינויים'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
