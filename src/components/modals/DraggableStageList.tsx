import {
  DndContext,
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensors,
  useSensor,
  MeasuringStrategy,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X, Grip } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StageData } from "@/types/purchases";

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

interface DraggableStageListProps {
  stages: StageData[];
  onStagesChange: (stages: StageData[]) => void;
  onAddStage?: () => void;
}

interface DroppableContainerProps {
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  stageMap: Record<UniqueIdentifier, StageData>;
  onRemoveStage: (stageId: number) => void;
  isSortingContainer: boolean;
}

interface SortableItemProps {
  id: UniqueIdentifier;
  stage: StageData;
  disabled?: boolean;
  onRemove: (stageId: number) => void;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

function DroppableContainer({ id, items, stageMap, onRemoveStage, isSortingContainer }: DroppableContainerProps) {
  const { active, attributes, isDragging, listeners, over, setNodeRef, transition, transform } = useSortable({
    id,
    data: {
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });

  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "container") || items.includes(over.id)
    : false;

  const containerStyle = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : undefined,
  };

  // Single stage - render as individual item
  if (items.length === 1) {
    const stage = stageMap[items[0]];
    if (!stage) return null;

    return (
      <div
        ref={setNodeRef}
        style={containerStyle}
        className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-all ${
          isOverContainer ? "ring-2 ring-green-500 bg-green-50" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
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
          {(stage.isNew || !stage.completion_date) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveStage(stage.id)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Multiple stages - render as stack
  return (
    <div
      ref={setNodeRef}
      style={containerStyle}
      className={`bg-blue-50 border-2 border-blue-200 rounded-lg p-3 transition-all ${
        isOverContainer ? "ring-2 ring-green-500 bg-green-100" : ""
      }`}
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
          <span className="text-sm font-medium text-blue-800">
            Parallel Stages (Priority {String(id).replace("priority-", "")})
          </span>
        </div>
      </div>
      <div className="space-y-2 ml-6">
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((itemId) => {
            const stage = stageMap[itemId];
            if (!stage) return null;
            return (
              <SortableItem
                key={itemId}
                id={itemId}
                stage={stage}
                disabled={isSortingContainer}
                onRemove={onRemoveStage}
              />
            );
          })}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableItem({ id, stage, disabled, onRemove }: SortableItemProps) {
  const { setNodeRef, listeners, isDragging, transform, transition } = useSortable({
    id,
    data: {
      type: "item",
      stage,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={disabled ? undefined : setNodeRef}
      style={style}
      className="bg-white border rounded p-2 flex items-center justify-between"
    >
      <div className="flex items-center space-x-2 flex-1">
        <div {...listeners} className="cursor-grab hover:cursor-grabbing p-0.5 hover:bg-gray-100 rounded">
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
      {(stage.isNew || !stage.completion_date) && (
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
}

export const DraggableStageList: React.FC<DraggableStageListProps> = ({ stages, onStagesChange, onAddStage }) => {
  // Convert stages to container-based structure
  const buildItemsFromStages = useCallback((stageList: StageData[]): Items => {
    const priorityGroups: Record<number, StageData[]> = {};

    stageList.forEach((stage) => {
      if (!priorityGroups[stage.priority]) {
        priorityGroups[stage.priority] = [];
      }
      priorityGroups[stage.priority].push(stage);
    });

    const items: Items = {};
    Object.entries(priorityGroups)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([priority, stageGroup]) => {
        items[`priority-${priority}`] = stageGroup.map((s) => s.id);
      });

    return items;
  }, []);

  // Build stage lookup map
  const buildStageMap = useCallback((stageList: StageData[]): Record<UniqueIdentifier, StageData> => {
    const map: Record<UniqueIdentifier, StageData> = {};
    stageList.forEach((stage) => {
      map[stage.id] = stage;
    });
    return map;
  }, []);

  const [items, setItems] = useState<Items>(() => buildItemsFromStages(stages));
  const [containers, setContainers] = useState<UniqueIdentifier[]>(() => Object.keys(items));
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isInternalUpdate = useRef(false);

  const stageMap = buildStageMap(stages);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

  // Update items when stages change externally (not from our own drag operations)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const newItems = buildItemsFromStages(stages);
    setItems(newItems);
    setContainers(Object.keys(newItems));
  }, [stages, buildItemsFromStages]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  /**
   * Custom collision detection strategy optimized for multiple containers
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((container) => container.id in items),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections = pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            const closestItem = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => container.id !== overId && containerItems.includes(container.id)
              ),
            })[0]?.id;

            // Use the closest item if found, otherwise use the container itself
            overId = closestItem !== undefined ? closestItem : overId;
          }
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
    setClonedItems(items);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;

    if (overId == null || active.id in items) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      setItems((items) => {
        const activeItems = items[activeContainer];
        const overItems = items[overContainer];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(active.id);

        let newIndex: number;

        if (overId in items) {
          // Dropping on a container - add to end
          newIndex = overItems.length;
        } else {
          // Dropping on an item within a container
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top > over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;
          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
        }

        recentlyMovedToNewContainer.current = true;

        return {
          ...items,
          [activeContainer]: items[activeContainer].filter((item) => item !== active.id),
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            items[activeContainer][activeIndex],
            ...items[overContainer].slice(newIndex, items[overContainer].length),
          ],
        };
      });
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    let finalItems = items;
    let finalContainers = containers;

    // Handle container reordering
    if (active.id in items && over?.id) {
      const activeIndex = containers.indexOf(active.id);
      const overIndex = containers.indexOf(over.id);
      finalContainers = arrayMove(containers, activeIndex, overIndex);
      setContainers(finalContainers);
    }

    const activeContainer = findContainer(active.id);

    if (!activeContainer) {
      setActiveId(null);
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      setActiveId(null);
      return;
    }

    const overContainer = findContainer(overId);

    // Handle item reordering within same container
    if (overContainer) {
      const activeIndex = items[activeContainer].indexOf(active.id);
      const overIndex = items[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        finalItems = {
          ...items,
          [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
        };
        setItems(finalItems);
      }
    }

    setActiveId(null);

    // Convert items back to stages with updated priorities
    isInternalUpdate.current = true;
    convertItemsToStages(finalItems, finalContainers);
  };

  const handleDragCancel = () => {
    if (clonedItems) {
      setItems(clonedItems);
    }
    setActiveId(null);
    setClonedItems(null);
  };

  const convertItemsToStages = (currentItems: Items, currentContainers: UniqueIdentifier[]) => {
    const updatedStages: StageData[] = [];

    currentContainers.forEach((containerId, index) => {
      const newPriority = index + 1;
      const containerItems = currentItems[containerId] || [];

      containerItems.forEach((stageId) => {
        const stage = stageMap[stageId];
        if (stage) {
          updatedStages.push({ ...stage, priority: newPriority });
        }
      });
    });

    onStagesChange(updatedStages);
  };

  const handleRemoveStage = (stageId: number) => {
    const updatedStages = stages.filter((stage) => stage.id !== stageId);
    onStagesChange(updatedStages);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  const renderDragOverlay = () => {
    if (!activeId) return null;

    // Dragging a container
    if (containers.includes(activeId)) {
      const containerItems = items[activeId];
      if (!containerItems) return null;

      // Single item container
      if (containerItems.length === 1) {
        const stage = stageMap[containerItems[0]];
        if (!stage) return null;

        return (
          <div className="bg-white border rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">{stage.stage_type?.display_name || "Unknown Stage"}</span>
              {stage.isNew && (
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              )}
            </div>
          </div>
        );
      }

      // Multi-item stack
      return (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Grip className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Parallel Stages (Priority {String(activeId).replace("priority-", "")})
            </span>
          </div>
          <div className="space-y-2 ml-6">
            {containerItems.map((itemId) => {
              const stage = stageMap[itemId];
              if (!stage) return null;
              return (
                <div key={itemId} className="bg-white border rounded p-2">
                  <span className="text-sm font-medium">{stage.stage_type?.display_name || "Unknown Stage"}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Dragging an item
    const stage = stageMap[activeId];
    if (!stage) return null;

    return (
      <div className="bg-white border rounded p-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <GripVertical className="h-3 w-3 text-gray-400" />
          <span className="text-sm font-medium">{stage.stage_type?.display_name || "Unknown Stage"}</span>
          {stage.isNew && (
            <Badge variant="secondary" className="text-xs">
              New
            </Badge>
          )}
        </div>
      </div>
    );
  };

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
        collisionDetection={collisionDetectionStrategy}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={containers} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {containers.map((containerId) => (
              <DroppableContainer
                key={containerId}
                id={containerId}
                items={items[containerId]}
                stageMap={stageMap}
                onRemoveStage={handleRemoveStage}
                isSortingContainer={isSortingContainer}
              />
            ))}
          </div>
        </SortableContext>

        {createPortal(<DragOverlay dropAnimation={dropAnimation}>{renderDragOverlay()}</DragOverlay>, document.body)}
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
