import { Workflow, Check, Trash2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

const createNewStageObject = (stageTypeId: number, stageTypeData: any, purchaseId: number, priority: number, customName: string | null = null, customNote: string | null = null) => {
  return {
    id: TEMP_NEW_STAGE_ID,
    stage_type_id: stageTypeId,
    priority,
    stage_type: stageTypeData,
    purchase_id: purchaseId,
    value: null,
    completion_date: null,
    note: customNote,
    custom_name: customName,
    days_since_previous_stage: null,
  };
};

const insertStageIntoGroups = (
  groupedStages: ReturnType<typeof groupStagesByPriority>,
  selectedPosition: SelectedPosition,
  newStage: ReturnType<typeof createNewStageObject>
) => {
  const { index, position } = selectedPosition;

  if (position === "inside") {
    groupedStages[index].push(newStage);
  } else if (position === "above") {
    groupedStages.splice(index, 0, [newStage]);
  } else if (position === "below") {
    groupedStages.splice(index + 1, 0, [newStage]);
  }

  return groupedStages;
};

// --- Sub-components defined OUTSIDE the modal to prevent remount on every render ---

interface NewStageFormProps {
  selectedStageTypeId: string;
  setSelectedStageTypeId: (v: string) => void;
  customStageName: string;
  setCustomStageName: (v: string) => void;
  customStageNote: string;
  setCustomStageNote: (v: string) => void;
  isLoading: boolean;
  stageTypesData: any;
  selectedStageTypeLabel: string | undefined;
}

const StageTypeSelectItems = ({ stageTypesData }: { stageTypesData: any }) => (
  <>
    {stageTypesData?.items?.map((stageType: any) => (
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
    <SelectItem value="custom">
      <div className="flex flex-col">
        <div className="font-medium">Custom</div>
        <div className="text-xs text-gray-500">User-defined custom stage</div>
      </div>
    </SelectItem>
  </>
);

const NewStagePlaceholder = ({
  compact = false,
  className = "",
  onMouseEnter,
  onMouseLeave,
  formProps,
}: {
  compact?: boolean;
  className?: string;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  formProps: NewStageFormProps;
}) => {
  const { selectedStageTypeId, setSelectedStageTypeId, customStageName, setCustomStageName, customStageNote, setCustomStageNote, isLoading, stageTypesData, selectedStageTypeLabel } = formProps;
  return (
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
        <Select
          value={selectedStageTypeId}
          onValueChange={(v) => {
            setSelectedStageTypeId(v);
            if (v !== "custom") {
              setCustomStageName("");
              setCustomStageNote("");
            }
          }}
          disabled={isLoading}
        >
          <SelectTrigger className={`bg-white border-blue-300 focus:ring-blue-500 ${compact ? "h-8 text-xs" : ""}`}>
            <SelectValue placeholder="Select a stage type">{selectedStageTypeLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <StageTypeSelectItems stageTypesData={stageTypesData} />
          </SelectContent>
        </Select>
      </div>
      {selectedStageTypeId === "custom" && (
        <>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-blue-700">
              Stage Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={customStageName}
              onChange={(e) => setCustomStageName(e.target.value)}
              placeholder="Enter stage name"
              dir="rtl"
              className={`bg-white border-blue-300 focus:ring-blue-500 ${compact ? "h-8 text-xs" : ""}`}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-blue-700">Notes</Label>
            <Input
              value={customStageNote}
              onChange={(e) => setCustomStageNote(e.target.value)}
              placeholder="Optional notes"
              dir="rtl"
              className={`bg-white border-blue-300 focus:ring-blue-500 ${compact ? "h-8 text-xs" : ""}`}
              disabled={isLoading}
            />
          </div>
        </>
      )}
    </div>
  );
};

interface StageItemProps {
  stage: any;
  index: number;
  isLast: boolean;
  hoveredIndex: number | null;
  onHoverEnter: (index: number) => void;
  onHoverLeave: () => void;
  selectedPosition: SelectedPosition | null;
  handleSelectPosition: (index: number, position: PositionType) => void;
  deletedStageIds: Set<number>;
  setDeletedStageIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  buttonHover: PositionType | null;
  setButtonHover: (hover: PositionType | null) => void;
  formProps: NewStageFormProps;
}

const StageItem = ({
  stage,
  index,
  isLast,
  hoveredIndex,
  onHoverEnter,
  onHoverLeave,
  selectedPosition,
  handleSelectPosition,
  deletedStageIds,
  setDeletedStageIds,
  buttonHover,
  setButtonHover,
  formProps,
}: StageItemProps) => {
  const { stageTypesData } = formProps;
  const isParallel = Array.isArray(stage);
  const isHovered = hoveredIndex === index;

  const isStageOptional = (s: any) => {
    if (s.stage_type?.name === "custom") return true;
    const fresh = stageTypesData?.items.find((st: any) => st.id === s.stage_type_id);
    return fresh ? fresh.is_optional : s.stage_type?.is_optional === true;
  };

  const isGroupOptional = isParallel
    ? stage.every((s: any) => isStageOptional(s))
    : isStageOptional(stage);

  const isAboveSelected = selectedPosition?.index === index && selectedPosition?.position === "above";
  const isBelowSelected = selectedPosition?.index === index && selectedPosition?.position === "below";
  const isInsideSelected = selectedPosition?.index === index && selectedPosition?.position === "inside";

  const getStageIds = (stageItem: any): number[] => {
    if (Array.isArray(stageItem)) {
      return stageItem.map((s: any) => s.id).filter((id: number) => id !== undefined);
    }
    return stageItem.id !== undefined ? [stageItem.id] : [];
  };

  const stageIds = getStageIds(stage);
  const isDeleted = stageIds.some((id) => deletedStageIds.has(id));
  const allDeleted = stageIds.length > 0 && stageIds.every((id) => deletedStageIds.has(id));

  const handleDeleteStage = (stageId: number) => {
    setDeletedStageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  return (
    <div className={`relative ${!isLast ? "mb-3" : ""}`}>
      {/* Above placeholder */}
      {isAboveSelected && <NewStagePlaceholder className="mb-3" formProps={formProps} />}

      {/* Stage item - outer wrapper handles hover to include the button area */}
      <div
        className="relative"
        onMouseEnter={() => onHoverEnter(index)}
        onMouseLeave={onHoverLeave}
      >
        {isHovered && (
          <div
            className="absolute z-20"
            style={{ left: "50%", transform: "translateX(-50%)", top: "-10px" }}
            onMouseEnter={() => setButtonHover("above")}
            onMouseLeave={() => setButtonHover(null)}
          >
            <div
              className={`text-white px-3 py-1 text-xs rounded-full font-medium shadow-lg flex items-center transition-all cursor-pointer ${
                buttonHover === "above" ? "bg-blue-600 scale-110" : "bg-blue-500"
              }`}
              onClick={() => handleSelectPosition(index, "above")}
            >
              Add above
            </div>
          </div>
        )}

        <div>
          {isParallel ? (
            <div
              className={`relative rounded-lg p-2 shadow-sm transition-all ${
                allDeleted
                  ? "bg-red-50 border-2 border-red-300 opacity-60"
                  : isHovered
                    ? "bg-purple-100 border-2 border-purple-300"
                    : "bg-purple-50 border-2 border-purple-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${allDeleted ? "text-red-700 line-through" : "text-purple-700"}`}
                  >
                    Parallel Stages
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-1 py-0 h-4 border-purple-200 ${
                      allDeleted ? "bg-red-100 text-red-800" : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    <Workflow className="w-3 h-3" />
                  </Badge>
                </div>
                {isGroupOptional && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 ${allDeleted ? "text-red-600 hover:text-red-700 hover:bg-red-100" : "text-gray-500 hover:text-red-600 hover:bg-red-50"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletedStageIds((prev) => {
                        const newSet = new Set(prev);
                        if (allDeleted) {
                          stageIds.forEach((id) => newSet.delete(id));
                        } else {
                          stageIds.forEach((id) => newSet.add(id));
                        }
                        return newSet;
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stage.map((item: any, i: number) => {
                  const itemIsDeleted = item.id !== undefined && deletedStageIds.has(item.id);
                  return (
                    <div
                      key={i}
                      className={`bg-white border px-2 py-1 text-xs rounded font-medium shadow-sm flex items-center gap-1.5 ${
                        itemIsDeleted
                          ? "border-red-300 text-red-600 line-through opacity-60"
                          : "border-purple-300 text-purple-900"
                      }`}
                    >
                      <span>{item.custom_name || item.stage_type?.display_name || item}</span>
                      {item.completion_date && !itemIsDeleted && (
                        <div className="w-3 h-3 rounded-full border bg-green-500 border-green-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                      {item.id !== undefined && item.stage_type?.is_optional === true && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`h-5 w-5 p-0 flex-shrink-0 ${
                            itemIsDeleted
                              ? "text-red-600 hover:text-red-700 hover:bg-red-100"
                              : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStage(item.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                {isInsideSelected && (
                  <NewStagePlaceholder
                    compact
                    className="w-full relative z-30 rounded"
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      onHoverEnter(index);
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                    }}
                    formProps={formProps}
                  />
                )}
              </div>

              {isHovered && !isInsideSelected && (
                <div
                  className="absolute inset-0 rounded-lg flex items-center justify-center z-10 transition-all"
                  onMouseEnter={() => setButtonHover("inside")}
                  onMouseLeave={() => setButtonHover(null)}
                >
                  <div
                    className={`text-white px-3 py-1 text-xs rounded-full font-medium shadow-lg flex items-center transition-all cursor-pointer ${
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
                isDeleted
                  ? "bg-red-50 border-2 border-red-300 opacity-60"
                  : isHovered
                    ? "bg-gray-100 border-2 border-gray-300"
                    : "bg-white border-2 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span
                    className={`text-sm font-medium ${isDeleted ? "text-red-600 line-through" : "text-gray-800"}`}
                  >
                    {stage.custom_name || stage.stage_type?.display_name || stage}
                  </span>
                  {stage.completion_date && !isDeleted && (
                    <div className="w-4 h-4 rounded-full border-2 bg-green-500 border-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                {isGroupOptional && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 ml-2 flex-shrink-0 ${
                      isDeleted
                        ? "text-red-600 hover:text-red-700 hover:bg-red-100"
                        : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (stage.id !== undefined) {
                        handleDeleteStage(stage.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {isHovered && (
          <div
            className="absolute z-20"
            style={{ left: "50%", transform: "translateX(-50%)", bottom: "-10px" }}
            onMouseEnter={() => setButtonHover("below")}
            onMouseLeave={() => setButtonHover(null)}
          >
            <div
              className={`text-white px-3 py-1 text-xs rounded-full font-medium shadow-lg flex items-center transition-all cursor-pointer ${
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
      {isBelowSelected && <NewStagePlaceholder className="mt-3" formProps={formProps} />}
    </div>
  );
};

// --- Main Modal Component ---

export const AddSingleStageModal: React.FC<AddSingleStageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  purchase,
  isLoading = false,
}) => {
  const [selectedStageTypeId, setSelectedStageTypeId] = useState<string>("");
  const [customStageName, setCustomStageName] = useState<string>("");
  const [customStageNote, setCustomStageNote] = useState<string>("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<SelectedPosition | null>(null);
  const [buttonHover, setButtonHover] = useState<PositionType | null>(null);
  const [deletedStageIds, setDeletedStageIds] = useState<Set<number>>(new Set());

  // Hover timeout prevents buttons from disappearing when mouse briefly leaves the stage card
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: stageTypesData } = useStageTypes();
  const { toast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedStageTypeId("");
      setCustomStageName("");
      setCustomStageNote("");
      setHoveredIndex(null);
      setSelectedPosition(null);
      setButtonHover(null);
      setDeletedStageIds(new Set());
    }
  }, [isOpen]);

  // Clear button hover state when moving to a different stage
  useEffect(() => {
    setButtonHover(null);
  }, [hoveredIndex]);

  const handleHoverEnter = (index: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredIndex(index);
  };

  const handleHoverLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 120);
  };

  const handleSelectPosition = (index: number, position: PositionType) => {
    setSelectedPosition({ index, position });
  };

  const handleSubmit = async () => {
    if (!purchase) {
      toast({ title: "Purchase data is missing", variant: "destructive" });
      return;
    }

    try {
      const stages = convertPurchaseToStages(purchase);

      const filteredStages = stages.filter((stage) => !deletedStageIds.has(stage.id));
      const groupedStages = groupStagesByPriority(filteredStages);

      if (selectedStageTypeId && selectedPosition) {
        const priority =
          selectedPosition.position === "inside" ? groupedStages[selectedPosition.index][0].priority : -1;

        if (selectedStageTypeId === "custom") {
          if (!customStageName.trim()) {
            toast({ title: "Custom stage name is required", variant: "destructive" });
            return;
          }
          const customStageTypeData = {
            id: -1,
            name: "custom",
            display_name: customStageName.trim(),
            description: "User-defined custom stage",
            value_required: false,
            is_optional: true,
            responsible_authority_id: 0,
            created_at: new Date().toISOString(),
            responsible_authority: null,
          };
          const newStage = createNewStageObject(-1, customStageTypeData, purchase.id, priority, customStageName.trim(), customStageNote.trim() || null);
          insertStageIntoGroups(groupedStages, selectedPosition, newStage);
        } else {
          const selectedStageTypeData = stageTypesData?.items.find((st: any) => st.id === parseInt(selectedStageTypeId));
          if (!selectedStageTypeData) {
            toast({ title: "Invalid stage type", variant: "destructive" });
            return;
          }
          const newStage = createNewStageObject(parseInt(selectedStageTypeId), selectedStageTypeData, purchase.id, priority);
          insertStageIntoGroups(groupedStages, selectedPosition, newStage);
        }
      }

      const nestedStages: Array<StageUpdateItem | StageUpdateItem[]> = groupedStages.map((group) => {
        const stageItems = group.map((stage) => {
          const item: StageUpdateItem = {};
          if (stage.id === TEMP_NEW_STAGE_ID) {
            if (stage.custom_name) {
              item.custom_name = stage.custom_name;
              if (stage.note) item.note = stage.note;
            } else {
              item.stage_type_id = stage.stage_type_id;
            }
          } else {
            item.id = stage.id;
          }
          return item;
        });

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
    setCustomStageName("");
    setCustomStageNote("");
    setHoveredIndex(null);
    setSelectedPosition(null);
    setButtonHover(null);
    setDeletedStageIds(new Set());
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      handleClose();
    }
  };

  const selectedStageType = selectedStageTypeId === "custom"
    ? null
    : stageTypesData?.items.find((st: any) => st.id.toString() === selectedStageTypeId);

  const selectedStageTypeLabel = selectedStageTypeId === "custom"
    ? "Custom"
    : selectedStageType?.display_name;

  const formProps: NewStageFormProps = {
    selectedStageTypeId,
    setSelectedStageTypeId,
    customStageName,
    setCustomStageName,
    customStageNote,
    setCustomStageNote,
    isLoading,
    stageTypesData,
    selectedStageTypeLabel,
  };

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
          <div className="flex-1 min-h-0 rounded-lg border-2 border-gray-300 overflow-hidden flex flex-col">
            <div className="overflow-y-auto p-4">
              {groupedStages.length > 0 ? (
                groupedStages.map((stage, index) => (
                  <StageItem
                    key={index}
                    stage={stage}
                    index={index}
                    isLast={index === groupedStages.length - 1}
                    hoveredIndex={hoveredIndex}
                    onHoverEnter={handleHoverEnter}
                    onHoverLeave={handleHoverLeave}
                    selectedPosition={selectedPosition}
                    handleSelectPosition={handleSelectPosition}
                    deletedStageIds={deletedStageIds}
                    setDeletedStageIds={setDeletedStageIds}
                    buttonHover={buttonHover}
                    setButtonHover={setButtonHover}
                    formProps={formProps}
                  />
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
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (deletedStageIds.size === 0 && (!selectedStageTypeId || !selectedPosition || (selectedStageTypeId === "custom" && !customStageName.trim())))}
          >
            {isLoading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
