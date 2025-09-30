import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StageData } from "@/types/purchases";
import { StageType } from "@/types/stageTypes";

interface AddStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stageData: Partial<StageData>) => void;
  availableStageTypes: StageType[];
  isLoading?: boolean;
  maxPriority: number;
}

export const AddStageModal: React.FC<AddStageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableStageTypes,
  isLoading = false,
  maxPriority,
}) => {
  const [selectedStageTypeId, setSelectedStageTypeId] = useState<string>("");
  const { toast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedStageTypeId("");
    } else {
      setSelectedStageTypeId("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStageTypeId) {
      toast({ title: "Please select a stage type", variant: "destructive" });
      return;
    }

    const selectedStageType = availableStageTypes.find((st) => st.id.toString() === selectedStageTypeId);

    if (!selectedStageType) {
      toast({ title: "Invalid stage type selected", variant: "destructive" });
      return;
    }

    try {
      const stageData: Partial<StageData> = {
        id: Date.now(),
        stage_type_id: parseInt(selectedStageTypeId),
        priority: maxPriority + 1, // Always add to end
        stage_type: selectedStageType,
        isNew: true,
        tempId: Date.now(),
      };

      onSubmit(stageData);
      onClose();
    } catch (_error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setSelectedStageTypeId("");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      handleClose();
    }
  };

  const isFormValid = selectedStageTypeId !== "";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Stage</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Stage Type <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedStageTypeId} onValueChange={setSelectedStageTypeId} disabled={isLoading}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a stage type" />
              </SelectTrigger>
              <SelectContent>
                {availableStageTypes?.map((stageType) => (
                  <SelectItem key={stageType.id} value={stageType.id.toString()}>
                    <div>
                      <div className="font-medium">{stageType.display_name}</div>
                      <div className="text-xs text-gray-500">{stageType.description}</div>
                      {stageType.responsible_authority && (
                        <div className="text-xs text-blue-600">Responsible: {stageType.responsible_authority.name}</div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isFormValid && <p className="text-sm text-red-500">Please fill in all required fields.</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isLoading}>
              {isLoading ? "Adding..." : "Add Stage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
