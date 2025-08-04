import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Supplier, SupplierCreateRequest, SupplierUpdateRequest } from "@/types/suppliers";

interface SupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: Supplier | null;
  onSave: (data: SupplierCreateRequest | SupplierUpdateRequest, editId?: number) => Promise<void>;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ open, onOpenChange, editItem, onSave }) => {
  const [supplierName, setSupplierName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editItem) {
      setSupplierName(editItem.name);
    } else {
      setSupplierName("");
    }
  }, [editItem]);

  const handleSave = async () => {
    if (!supplierName.trim()) {
      toast({ title: "Please enter a supplier name", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const data = { name: supplierName.trim() };
      await onSave(data, editItem?.id);

      onOpenChange(false);
      setSupplierName("");
    } catch (_error) {
      // Error handling is done in the parent component
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSupplierName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Supplier" : "Create New Supplier"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="supplierName" className="text-sm mb-2 block">
              Supplier Name
            </Label>
            <Input
              id="supplierName"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Enter supplier name"
              className="h-8"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={handleCancel} size="sm">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" disabled={isSaving}>
              {isSaving ? "Saving..." : editItem ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierModal;
