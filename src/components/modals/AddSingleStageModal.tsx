import { Workflow, Check } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useStageTypes } from "@/hooks/useStageTypes";
import { Purchase, PurchaseUpdateRequest, StageUpdateItem } from "@/types/purchases";
import { convertPurchaseToStages } from "@/utils/stageUtils";

interface AddSingleStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (purchaseId: number, purchaseData: PurchaseUpdateRequest) => Promise<void>;
  purchase: Purchase | null;
  isLoading?: boolean;
}

type PositionType = "above" | "below" | "inside";

interface SelectedPosition {
  index: number;
  position: PositionType;
}

// Constants
const TEMP_NEW_STAGE_ID = -1;

// Helper Functions

/**
 * Groups stages by priority and returns them as an array of groups
 * Each group contains stages with the same priority
 */
const groupStagesByPriority = (stages: ReturnType<typeof convertPurchaseToStages>) => {
  const priorityGroups: Map<number, typeof stages> = new Map();

  stages.forEach((stage) => {
    if (!priorityGroups.has(stage.priority)) {
      priorityGroups.set(stage.priority, []);
    }
    const group = priorityGroups.get(stage.priority);
    if (group) {
      group.push(stage);
    }
  });

  const sortedPriorities = Array.from(priorityGroups.keys()).sort((a, b) => a - b);
  return sortedPriorities
    .map((priority) => {
      const group = priorityGroups.get(priority);
      return group || [];
    })
    .filter((group) => group.length > 0);
};

/**
 * Creates a new stage object for insertion into the timeline
 */
const createNewStageObject = (stageTypeId: number, stageTypeData: any, purchaseId: number, priority: number) => {
  return {
    id: TEMP_NEW_STAGE_ID,
    stage_type_id: stageTypeId,
    priority,
    stage_type: stageTypeData,
    purchase_id: purchaseId,
    value: null,
    completion_date: null,
    days_since_previous_stage: null,
  };
};

/**
 * Inserts a new stage into the grouped stages array based on the selected position
 */
const insertStageIntoGroups = (
  groupedStages: ReturnType<typeof groupStagesByPriority>,
  selectedPosition: SelectedPosition,
  newStage: ReturnType<typeof createNewStageObject>
) => {
  const { index, position } = selectedPosition;

  if (position === "inside") {
    // Add to existing parallel group
    groupedStages[index].push(newStage);
  } else if (position === "above") {
    // Insert new stage group above
    groupedStages.splice(index, 0, [newStage]);
  } else if (position === "below") {
    // Insert new stage group below
    groupedStages.splice(index + 1, 0, [newStage]);
  }

  return groupedStages;
};

export const AddSingleStageModal: React.FC<AddSingleStageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  purchase,
  isLoading = false,
}) => {
  const [selectedStageTypeId, setSelectedStageTypeId] = useState<string>("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<SelectedPosition | null>(null);
  const [buttonHover, setButtonHover] = useState<PositionType | null>(null);

  const { data: stageTypesData } = useStageTypes();
  const { toast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedStageTypeId("");
      setHoveredIndex(null);
      setSelectedPosition(null);
      setButtonHover(null);
    }
  }, [isOpen]);

  // Clear button hover state when moving to a different stage
  useEffect(() => {
    setButtonHover(null);
  }, [hoveredIndex]);

  const handleSelectPosition = (index: number, position: PositionType) => {
    setSelectedPosition({ index, position });
  };

  const handleSubmit = async () => {
    if (!selectedStageTypeId || !selectedPosition || !purchase) {
      toast({ title: "Please select a stage type and position", variant: "destructive" });
      return;
    }

    try {
      const stages = convertPurchaseToStages(purchase);

      // Group stages by priority to build the nested structure
      const groupedStages = groupStagesByPriority(stages);

      // Get selected stage type data
      const selectedStageTypeData = stageTypesData?.items.find((st) => st.id === parseInt(selectedStageTypeId));

      if (!selectedStageTypeData) {
        toast({ title: "Invalid stage type", variant: "destructive" });
        return;
      }

      // Create new stage object
      const priority = selectedPosition.position === "inside" ? groupedStages[selectedPosition.index][0].priority : -1;
      const newStage = createNewStageObject(
        parseInt(selectedStageTypeId),
        selectedStageTypeData,
        purchase.id,
        priority
      );

      // Insert new stage into grouped stages
      insertStageIntoGroups(groupedStages, selectedPosition, newStage);

      // Convert back to nested array format for API
      const nestedStages: Array<StageUpdateItem | StageUpdateItem[]> = groupedStages.map((group) => {
        const stageItems = group.map((stage) => {
          const item: StageUpdateItem = {};
          if (stage.id === TEMP_NEW_STAGE_ID) {
            // New stage
            item.stage_type_id = stage.stage_type_id;
          } else {
            // Existing stage
            item.id = stage.id;
          }
          return item;
        });

        // If only one stage in group, return single object, otherwise return array
        return stageItems.length === 1 ? stageItems[0] : stageItems;
      });

      await onSubmit(purchase.id, { stages: nestedStages });
      onClose();
    } catch (_error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setSelectedStageTypeId("");
    setHoveredIndex(null);
    setSelectedPosition(null);
    setButtonHover(null);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      handleClose();
    }
  };

  // Get selected stage type for preview
  const selectedStageType = stageTypesData?.items.find((st) => st.id.toString() === selectedStageTypeId);

  // Reusable component for stage type select items
  const StageTypeSelectItems = () => (
    <>
      {stageTypesData?.items?.map((stageType) => (
        <SelectItem key={stageType.id} value={stageType.id.toString()}>
          <div className="flex flex-col">
            <div className="font-medium">{stageType.display_name}</div>
            <div className="text-xs text-gray-500">{stageType.description}</div>
            {stageType.responsible_authority && (
              <div className="text-xs text-blue-600">Responsible: {stageType.responsible_authority.name}</div>
            )}
          </div>
        </SelectItem>
      ))}
    </>
  );

  // Reusable component for new stage placeholder with selector
  const NewStagePlaceholder = ({
    compact = false,
    className = "",
    onMouseEnter,
    onMouseLeave,
  }: {
    compact?: boolean;
    className?: string;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
  }) => (
    <div
      className={`bg-blue-50 border-2 border-dashed border-blue-400 rounded-lg ${compact ? "p-2" : "p-3"} ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center gap-2 mb-2 text-blue-600">
        <Workflow className={compact ? "w-3 h-3" : "w-4 h-4"} />
        <span className={`font-semibold ${compact ? "text-xs" : "text-sm"}`}>New Stage</span>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-blue-700">
          Stage Type <span className="text-red-500">*</span>
        </Label>
        <Select value={selectedStageTypeId} onValueChange={setSelectedStageTypeId} disabled={isLoading}>
          <SelectTrigger className={`bg-white border-blue-300 focus:ring-blue-500 ${compact ? "h-8 text-xs" : ""}`}>
            <SelectValue placeholder="Select a stage type">{selectedStageType?.display_name}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <StageTypeSelectItems />
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Render stage preview in modal
  const StageItem = ({ stage, index, isLast }: { stage: any; index: number; isLast: boolean }) => {
    const isParallel = Array.isArray(stage);
    const isHovered = hoveredIndex === index;

    const isAboveSelected = selectedPosition?.index === index && selectedPosition?.position === "above";
    const isBelowSelected = selectedPosition?.index === index && selectedPosition?.position === "below";
    const isInsideSelected = selectedPosition?.index === index && selectedPosition?.position === "inside";

    return (
      <div className={`relative ${!isLast ? "mb-3" : ""}`}>
        {/* Above placeholder */}
        {isAboveSelected && <NewStagePlaceholder className="mb-3" />}

        {/* Stage item */}
        <div className="relative">
          {isHovered && (
            <div
              className="absolute z-20 pointer-events-none"
              style={{ left: "50%", transform: "translateX(-50%)", top: "-10px" }}
              onMouseEnter={() => setButtonHover("above")}
              onMouseLeave={() => setButtonHover(null)}
            >
              <div
                className={`text-white px-3 py-1 text-xs rounded-full font-medium shadow-lg flex items-center transition-all cursor-pointer pointer-events-auto ${
                  buttonHover === "above" ? "bg-blue-600 scale-110" : "bg-blue-500"
                }`}
                onClick={() => handleSelectPosition(index, "above")}
              >
                Add above
              </div>
            </div>
          )}

          <div onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
            {isParallel ? (
              <div
                className={`relative rounded-lg p-2 shadow-sm transition-all ${
                  isHovered ? "bg-purple-100 border-2 border-purple-300" : "bg-purple-50 border-2 border-purple-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-purple-700">Parallel Stages</span>
                  <Badge
                    variant="secondary"
                    className="text-xs px-1 py-0 h-4 bg-purple-100 text-purple-800 border-purple-200"
                  >
                    <Workflow className="w-3 h-3" />
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stage.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="bg-white border border-purple-300 px-2 py-1 text-xs rounded text-purple-900 font-medium shadow-sm flex items-center gap-1.5"
                    >
                      <span>{item.stage_type?.display_name || item}</span>
                      {item.completion_date && (
                        <div className="w-3 h-3 rounded-full border bg-green-500 border-green-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isInsideSelected && (
                    <NewStagePlaceholder
                      compact
                      className="w-full relative z-30 rounded"
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        setHoveredIndex(null);
                      }}
                      onMouseLeave={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  )}
                </div>

                {isHovered && !isInsideSelected && (
                  <div
                    className="absolute inset-0 rounded-lg flex items-center justify-center z-10 transition-all pointer-events-none"
                    onMouseEnter={() => setButtonHover("inside")}
                    onMouseLeave={() => setButtonHover(null)}
                  >
                    <div
                      className={`text-white px-3 py-1 text-xs rounded-full font-medium shadow-lg flex items-center transition-all pointer-events-auto cursor-pointer ${
                        buttonHover === "inside" ? "bg-blue-600 scale-110" : "bg-blue-500"
                      }`}
                      onClick={() => handleSelectPosition(index, "inside")}
                    >
                      Add to group
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`rounded-lg p-3 shadow-sm transition-all ${
                  isHovered ? "bg-gray-100 border-2 border-gray-300" : "bg-white border-2 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{stage.stage_type?.display_name || stage}</span>
                  {stage.completion_date && (
                    <div className="w-4 h-4 rounded-full border-2 bg-green-500 border-green-500 flex items-center justify-center flex-shrink-0 ml-2">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {isHovered && (
            <div
              className="absolute z-20 pointer-events-none"
              style={{ left: "50%", transform: "translateX(-50%)", bottom: "-10px" }}
              onMouseEnter={() => setButtonHover("below")}
              onMouseLeave={() => setButtonHover(null)}
            >
              <div
                className={`text-white px-3 py-1 text-xs rounded-full font-medium shadow-lg flex items-center transition-all cursor-pointer pointer-events-auto ${
                  buttonHover === "below" ? "bg-blue-600 scale-110" : "bg-blue-500"
                }`}
                onClick={() => handleSelectPosition(index, "below")}
              >
                Add below
              </div>
            </div>
          )}
        </div>

        {/* Below placeholder */}
        {isBelowSelected && <NewStagePlaceholder className="mt-3" />}
      </div>
    );
  };

  // Group stages by priority for display
  const getGroupedStages = () => {
    if (!purchase) return [];

    const stages = convertPurchaseToStages(purchase);
    const groupedStages = groupStagesByPriority(stages);

    return groupedStages
      .map((group) => {
        return group.length === 1 ? group[0] : group;
      })
      .filter(Boolean);
  };

  const groupedStages = getGroupedStages();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Stage to Timeline</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col space-y-4 overflow-hidden">
          {/* Position Selection */}
          <div className="px-1 flex-shrink-0">
            <Label className="text-sm font-medium">
              Stage Position <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              {selectedPosition
                ? "✓ Position selected - Select a stage type to confirm"
                : "Hover over stages and click a placement option"}
            </p>
          </div>

          {/* Stages Preview */}
          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="rounded-lg p-4 border-2 border-gray-300">
              {groupedStages.length > 0 ? (
                groupedStages.map((stage, index) => (
                  <StageItem key={index} stage={stage} index={index} isLast={index === groupedStages.length - 1} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No stages in timeline</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedStageTypeId || !selectedPosition || isLoading}>
            {isLoading ? "Adding..." : "Add Stage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
