import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useBudgetSources } from "@/hooks/useBudgetSources";
import { Purchase, PurchaseUpdateRequest } from "@/types";

interface EditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (purchaseId: string, purchaseData: PurchaseUpdateRequest) => Promise<void>;
  purchase: Purchase | null;
  isLoading?: boolean;
}

export const EditPurchaseModal: React.FC<EditPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  purchase,
  isLoading = false,
}) => {
  const [selectedBudgetSourceId, setSelectedBudgetSourceId] = useState<string>("");
  const { data: budgetSourcesData } = useBudgetSources();
  const { toast } = useToast();

  // Reset and populate form when modal opens or purchase changes
  useEffect(() => {
    if (isOpen && purchase) {
      setSelectedBudgetSourceId(purchase.budget_source?.id?.toString() || "");
    } else if (!isOpen) {
      setSelectedBudgetSourceId("");
    }
  }, [isOpen, purchase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!purchase) {
      toast({ title: "No purchase selected", variant: "destructive" });
      return;
    }

    if (!selectedBudgetSourceId) {
      toast({ title: "Please select a budget source", variant: "destructive" });
      return;
    }

    try {
      const purchaseData: PurchaseUpdateRequest = {
        budget_source_id: parseInt(selectedBudgetSourceId),
      };

      await onSubmit(purchase.id.toString(), purchaseData);
      onClose();
    } catch (_error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setSelectedBudgetSourceId("");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // When closing the modal, reset the form like Cancel button
      setSelectedBudgetSourceId(purchase?.budget_source?.id?.toString() || "");
    }
    if (!isLoading) {
      onClose();
    }
  };

  const isFormValid = selectedBudgetSourceId !== "";
  const hasChanges = selectedBudgetSourceId !== (purchase?.budget_source?.id?.toString() || "");

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Purchase</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Budget Source <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedBudgetSourceId} onValueChange={setSelectedBudgetSourceId} disabled={isLoading}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a budget source" />
              </SelectTrigger>
              <SelectContent>
                {budgetSourcesData?.items?.map((budgetSource) => (
                  <SelectItem key={budgetSource.id} value={budgetSource.id.toString()}>
                    {budgetSource.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isFormValid && <p className="text-sm text-red-500">Please select a budget source.</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || !hasChanges || isLoading}>
              {isLoading ? "Updating..." : "Update Purchase"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
