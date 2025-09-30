import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useStageTypes } from "@/hooks/useStageTypes";
import { Purchase, PurchaseUpdateRequest, StageUpdateItem } from "@/types";
import { StageData } from "@/types/purchases";
import { convertPurchaseToStages } from "@/utils/stageUtils";

import { AddStageModal } from "./AddStageModal";
import { DraggableStageList } from "./DraggableStageList";

interface EditTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (purchaseId: number, purchaseData: PurchaseUpdateRequest) => Promise<void>;
  purchase: Purchase | null;
  isLoading?: boolean;
}

export const EditTimelineModal: React.FC<EditTimelineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  purchase,
  isLoading = false,
}) => {
  const [stages, setStages] = useState<StageData[]>([]);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [timelineHasChanges, setTimelineHasChanges] = useState(false);

  const { data: stageTypesData } = useStageTypes();
  const { toast } = useToast();

  // Reset and populate form when modal opens or purchase changes
  useEffect(() => {
    if (isOpen && purchase) {
      // Convert purchase stages to timeline format
      const purchaseStages = convertPurchaseToStages(purchase);
      const stageData: StageData[] = purchaseStages.map((stage) => ({
        id: stage.id,
        stage_type_id: stage.stage_type.id,
        priority: stage.priority,
        value: stage.value,
        completion_date: stage.completion_date,
        days_since_previous_stage: stage.days_since_previous_stage,
        stage_type: stage.stage_type,
        purchase_id: purchase.id,
        isNew: false,
      }));
      setStages(stageData);
      setTimelineHasChanges(false);
    } else if (!isOpen) {
      setStages([]);
      setTimelineHasChanges(false);
    }
  }, [isOpen, purchase]);

  const handleTimelineSubmit = async () => {
    if (!purchase) {
      toast({ title: "No purchase selected", variant: "destructive" });
      return;
    }

    try {
      // Convert flat stages array to nested format with parallel stages grouped
      const stagesGroupedByPriority: Map<number, StageData[]> = new Map();

      stages.forEach((stage) => {
        if (!stagesGroupedByPriority.has(stage.priority)) {
          stagesGroupedByPriority.set(stage.priority, []);
        }
        stagesGroupedByPriority.get(stage.priority)!.push(stage);
      });

      // Sort by priority and build nested array
      const sortedPriorities = Array.from(stagesGroupedByPriority.keys()).sort((a, b) => a - b);
      const nestedStages: Array<StageUpdateItem | StageUpdateItem[]> = sortedPriorities.map((priority) => {
        const stagesAtPriority = stagesGroupedByPriority.get(priority)!;
        const stageItems = stagesAtPriority.map((stage) => {
          const item: StageUpdateItem = {};
          if (stage.isNew) {
            item.stage_type_id = stage.stage_type_id;
          } else {
            item.id = stage.id;
          }
          return item;
        });

        // If only one stage at this priority, return single object, otherwise return array
        return stageItems.length === 1 ? stageItems[0] : stageItems;
      });

      await onSubmit(purchase.id, { stages: nestedStages });
      setTimelineHasChanges(false);
      onClose();
    } catch (_error) {
      // Error handling is done in the parent component
    }
  };

  const handleStagesChange = (newStages: StageData[]) => {
    setStages(newStages);
    setTimelineHasChanges(true);
  };

  const handleAddStage = (stageData: Partial<StageData>) => {
    if (!stageData.stage_type) return;

    const newStage: StageData = {
      id: stageData.id || Date.now(),
      stage_type_id: stageData.stage_type_id || 0,
      priority: stageData.priority || 1,
      stage_type: stageData.stage_type,
      purchase_id: purchase?.id || 0,
      isNew: true,
      tempId: stageData.tempId,
    };

    // Simply add to end - no priority adjustment needed
    setStages([...stages, newStage]);
    setTimelineHasChanges(true);
  };

  const maxPriority = Math.max(0, ...stages.map((s) => s.priority));

  const handleClose = () => {
    setStages([]);
    setTimelineHasChanges(false);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimelineHasChanges(false);
    }
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Timeline</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <DraggableStageList
              stages={stages}
              onStagesChange={handleStagesChange}
              onAddStage={() => setShowAddStageModal(true)}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleTimelineSubmit} disabled={!timelineHasChanges || isLoading}>
                {isLoading ? "Updating..." : "Update Timeline"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AddStageModal
        isOpen={showAddStageModal}
        onClose={() => setShowAddStageModal(false)}
        onSubmit={handleAddStage}
        availableStageTypes={stageTypesData?.items || []}
        maxPriority={maxPriority}
        isLoading={isLoading}
      />
    </>
  );
};
