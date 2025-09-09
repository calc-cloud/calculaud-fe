import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BudgetSource, BudgetSourceCreateRequest, BudgetSourceUpdateRequest } from "@/types/budgetSources";

interface BudgetSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: BudgetSource | null;
  onSave: (data: BudgetSourceCreateRequest | BudgetSourceUpdateRequest, editId?: number) => Promise<void>;
}

const BudgetSourceModal: React.FC<BudgetSourceModalProps> = ({ open, onOpenChange, editItem, onSave }) => {
  const [budgetSourceName, setBudgetSourceName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editItem) {
      setBudgetSourceName(editItem.name);
    } else {
      setBudgetSourceName("");
    }
  }, [editItem]);

  const handleSave = async () => {
    if (!budgetSourceName.trim()) {
      toast({ title: "Please enter a budget source name", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const data = { name: budgetSourceName.trim() };
      await onSave(data, editItem?.id);

      onOpenChange(false);
      setBudgetSourceName("");
    } catch (_error) {
      // Error handling is done in the parent component
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setBudgetSourceName("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // When closing the modal, reset the form like Cancel button
      setBudgetSourceName(editItem?.name || "");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Budget Source" : "Create New Budget Source"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="budgetSourceName" className="text-sm mb-2 block">
              Budget Source Name
            </Label>
            <Input
              id="budgetSourceName"
              value={budgetSourceName}
              onChange={(e) => setBudgetSourceName(e.target.value)}
              placeholder="Enter budget source name"
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

export default BudgetSourceModal;
