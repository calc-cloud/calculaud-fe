import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X, Grip } from "lucide-react";
import React, { useState, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StageData } from "@/types/purchases";

interface StageStack {
  id: number;
  priority: number;
  stages: StageData[];
}

interface DraggableStageListProps {
  stages: StageData[];
  onStagesChange: (stages: StageData[]) => void;
  onAddStage?: () => void;
}

interface SortableStageProps {
  stage: StageData;
  isDragging?: boolean;
  isInStack?: boolean;
  onRemove?: (stageId: number) => void;
  isHighlighted?: boolean;
}

interface SortableStackProps {
  stack: StageStack;
  isDragging?: boolean;
  onRemoveStage?: (stageId: number) => void;
  isHighlighted?: boolean;
  dragOverStage?: string | number | null;
}

interface DropZoneProps {
  id: string;
  index: number;
  isActive: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ id, isActive }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-2 transition-all ${isActive && isOver ? "border-b-2 border-blue-500 bg-blue-50" : ""}`}
      style={{
        height: isActive && isOver ? "8px" : "2px",
        margin: isActive && isOver ? "4px 0" : "0",
      }}
    />
  );
};

const SortableStage: React.FC<SortableStageProps> = ({
  stage,
  isDragging,
  isInStack = false,
  onRemove,
  isHighlighted = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: stage.id,
    data: {
      type: "stage",
      stage,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-all ${
        isDragging || isSortableDragging ? "ring-2 ring-blue-500" : ""
      } ${isHighlighted ? "ring-2 ring-green-500 bg-green-50" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          {!isInStack && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{stage.stage_type?.display_name || "Unknown Stage"}</span>
              {stage.isNew && (
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              )}
            </div>
          </div>
        </div>
        {onRemove && (stage.isNew || !stage.completion_date) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(stage.id)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

const SortableStackedStage: React.FC<SortableStageProps> = ({ stage, isDragging, onRemove, isHighlighted = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: stage.id,
    data: {
      type: "stage",
      stage,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded p-2 flex items-center justify-between ${
        isDragging || isSortableDragging ? "ring-2 ring-blue-500" : ""
      } ${isHighlighted ? "ring-2 ring-green-500 bg-green-50" : ""}`}
    >
      <div className="flex items-center space-x-2 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-0.5 hover:bg-gray-100 rounded"
        >
          <GripVertical className="h-3 w-3 text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{stage.stage_type?.display_name || "Unknown Stage"}</span>
            {stage.isNew && (
              <Badge variant="secondary" className="text-xs">
                New
              </Badge>
            )}
          </div>
        </div>
      </div>
      {onRemove && (stage.isNew || !stage.completion_date) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(stage.id)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

const SortableStack: React.FC<SortableStackProps> = ({
  stack,
  isDragging,
  onRemoveStage,
  isHighlighted = false,
  dragOverStage = null,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: `stack-${stack.id}`,
    data: {
      type: "stack",
      stack,
    },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `stack-drop-${stack.id}`,
    data: {
      type: "stack-drop-zone",
      stack,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  if (stack.stages.length === 1) {
    return (
      <div ref={setDroppableRef}>
        <SortableStage
          stage={stack.stages[0]}
          isDragging={isDragging}
          onRemove={onRemoveStage}
          isHighlighted={isHighlighted || isOver}
        />
      </div>
    );
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      style={style}
      className={`bg-blue-50 border-2 border-blue-200 rounded-lg p-3 transition-all ${
        isDragging || isSortableDragging ? "ring-2 ring-blue-500" : ""
      } ${isHighlighted || isOver ? "ring-2 ring-green-500 bg-green-100" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1 hover:bg-blue-100 rounded"
          >
            <Grip className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-blue-800">Parallel Stages (Priority {stack.priority})</span>
        </div>
      </div>
      <div className="space-y-2 ml-6">
        <SortableContext items={stack.stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {stack.stages.map((stage) => (
            <SortableStackedStage
              key={stage.id}
              stage={stage}
              onRemove={onRemoveStage}
              isHighlighted={dragOverStage === stage.id}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const DraggableStageList: React.FC<DraggableStageListProps> = ({ stages, onStagesChange, onAddStage }) => {
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [dragOverContainer, setDragOverContainer] = useState<string | number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group stages by priority to create stacks
  const createStacks = useCallback((stageList: StageData[]): StageStack[] => {
    const priorityGroups = stageList.reduce(
      (groups, stage) => {
        const priority = stage.priority;
        if (!groups[priority]) {
          groups[priority] = [];
        }
        groups[priority].push(stage);
        return groups;
      },
      {} as Record<number, StageData[]>
    );

    return Object.entries(priorityGroups)
      .map(([priority, stageGroup]) => ({
        id: parseInt(priority), // Use numeric priority as ID
        priority: parseInt(priority),
        stages: stageGroup,
      }))
      .sort((a, b) => a.priority - b.priority);
  }, []);

  const stacks = createStacks(stages);
  const allIds = [...stacks.map((stack) => `stack-${stack.id}`), ...stages.map((stage) => stage.id)];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (!over) {
      setDragOverContainer(null);
      return;
    }

    const overId = over.id; // UniqueIdentifier (string | number)
    setDragOverContainer(overId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOverContainer(null);

    if (!over) return;

    const activeId = active.id; // UniqueIdentifier (string | number)
    const overId = over.id; // UniqueIdentifier (string | number)
    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeId === overId) return;

    // Handle different drag scenarios
    if (activeData?.type === "stack" && overData?.type === "stack") {
      // Stack to stack reordering
      const activeStackId = `stack-${activeData.stack.id}`;
      const overStackId = `stack-${overData.stack.id}`;

      const stackIds = stacks.map((stack) => `stack-${stack.id}`);
      const oldIndex = stackIds.indexOf(activeStackId);
      const newIndex = stackIds.indexOf(overStackId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedStacks = arrayMove(stacks, oldIndex, newIndex);

        // Reassign priorities based on new order
        const updatedStages: StageData[] = [];
        reorderedStacks.forEach((stack, index) => {
          const newPriority = index + 1;
          stack.stages.forEach((stage) => {
            updatedStages.push({ ...stage, priority: newPriority });
          });
        });

        onStagesChange(updatedStages);
      }
    } else if (activeData?.type === "stage") {
      // Stage dragging
      const activeStage = activeData.stage;

      if (overData?.type === "stack-drop-zone") {
        // Dropping stage into stack
        const targetStack = overData.stack;
        const updatedStages = stages.map((stage) => {
          if (stage.id === activeStage.id) {
            return { ...stage, priority: targetStack.priority };
          }
          return stage;
        });
        onStagesChange(updatedStages);
      } else if (overData?.type === "stage") {
        // Dropping stage on another stage (create stack or join)
        const targetStage = overData.stage;
        const updatedStages = stages.map((stage) => {
          if (stage.id === activeStage.id) {
            return { ...stage, priority: targetStage.priority };
          }
          return stage;
        });
        onStagesChange(updatedStages);
      } else if (typeof overId === "string" && overId.startsWith("drop-zone-")) {
        // Dropping on insertion line
        const insertIndex = parseInt(overId.split("-")[2]);
        const newPriority = insertIndex + 1;

        // Update priorities for reordering
        const updatedStages = stages.map((stage) => {
          if (stage.id === activeStage.id) {
            return { ...stage, priority: newPriority };
          } else if (stage.priority >= newPriority && stage.id !== activeStage.id) {
            return { ...stage, priority: stage.priority + 1 };
          }
          return stage;
        });
        onStagesChange(updatedStages);
      }
    }
  };

  const handleRemoveStage = (stageId: number) => {
    const updatedStages = stages.filter((stage) => stage.id !== stageId);
    onStagesChange(updatedStages);
  };

  const getActiveItem = () => {
    if (!activeId) return null;

    // Stack IDs are strings like "stack-1", stage IDs are numbers
    if (typeof activeId === "string" && activeId.startsWith("stack-")) {
      return stacks.find((stack) => `stack-${stack.id}` === activeId);
    } else {
      return stages.find((stage) => stage.id === activeId);
    }
  };

  const activeItem = getActiveItem();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Timeline Stages</h3>
        {onAddStage && (
          <Button variant="outline" size="sm" onClick={onAddStage}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stage
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {stacks.map((stack, index) => (
              <div key={`stack-${stack.id}`} className="relative">
                <DropZone
                  id={`drop-zone-${index}`}
                  index={index}
                  isActive={!!activeId && typeof activeId === "number"}
                />
                <SortableStack
                  stack={stack}
                  isDragging={typeof activeId === "string" && `stack-${stack.id}` === activeId}
                  onRemoveStage={handleRemoveStage}
                  isHighlighted={
                    typeof dragOverContainer === "string" &&
                    dragOverContainer === `stack-drop-${stack.id}` &&
                    !(typeof activeId === "string" && `stack-${stack.id}` === activeId)
                  }
                  dragOverStage={dragOverContainer}
                />
              </div>
            ))}
            <DropZone
              id={`drop-zone-${stacks.length}`}
              index={stacks.length}
              isActive={!!activeId && typeof activeId === "number"}
            />
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem && typeof activeId === "string" && activeId.startsWith("stack-") && (
            <SortableStack stack={activeItem as StageStack} isDragging onRemoveStage={handleRemoveStage} />
          )}
          {activeItem && typeof activeId === "number" && (
            <SortableStage stage={activeItem as StageData} isDragging onRemove={handleRemoveStage} />
          )}
        </DragOverlay>
      </DndContext>

      {stages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No stages in timeline</p>
          {onAddStage && (
            <Button variant="outline" onClick={onAddStage}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Stage
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
