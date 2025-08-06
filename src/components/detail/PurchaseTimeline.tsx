import { Check, Trash2, Workflow, X, Info } from "lucide-react";
import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { formatPurchaseId, getPurchaseStatus, getStatusTextColor, getStatusBorderColor } from "@/utils/purchaseUtils";
import { convertPurchaseToStages, calculateDaysSinceLastStageCompletion, getStagesText } from "@/utils/stageUtils";

interface PurchaseTimelineProps {
  purchase: any;
  purchaseIndex: number;
  totalPurchases: number;
  editingStage: string | null;
  selectedStage: any | null;
  editForm: { date: string; text: string };
  isUpdatingStage: boolean;
  onStageClick: (stage: any) => void;
  onEditCancel: () => void;
  onCloseStagePopup: () => void;
  onSaveStage: (stage: any) => Promise<void>;
  onDeletePurchase: (purchaseId: string) => Promise<void>;
  setEditForm: (form: { date: string; text: string }) => void;
  // Utility functions
  getStageDisplayDate: (stage: any) => string;
  hasMultipleStagesWithSamePriority: (stages: any[], stage: any) => boolean;
  getPriorityVariant: (priority: number) => "secondary" | "outline" | "default";
  isCurrentPendingStage: (stage: any, purchase: any) => boolean;
  calculateStagePosition: (stages: any[], stageIndex: number) => number;
  isPurchaseComplete: (purchase: any) => boolean;
}

export const PurchaseTimeline: React.FC<PurchaseTimelineProps> = ({
  purchase,
  purchaseIndex,
  totalPurchases,
  editingStage,
  selectedStage,
  editForm,
  isUpdatingStage,
  onStageClick,
  onEditCancel,
  onCloseStagePopup,
  onSaveStage,
  onDeletePurchase,
  setEditForm,
  getStageDisplayDate,
  hasMultipleStagesWithSamePriority,
  getPriorityVariant,
  isCurrentPendingStage,
  calculateStagePosition,
  isPurchaseComplete,
}) => {
  const stages = convertPurchaseToStages(purchase);
  const purchaseStatus = getPurchaseStatus(purchase);
  const purchaseId = formatPurchaseId(purchase.id);

  const renderStageCard = (stage: any, index: number, isAboveTimeline: boolean) => {
    const position = calculateStagePosition(stages, index);
    const isExpanded = selectedStage?.id === stage.id;
    const positioningClass = isAboveTimeline
      ? "absolute bottom-0 flex flex-col items-center"
      : "absolute top-0 flex flex-col items-center";

    return (
      <div key={`${stage.id}-${isAboveTimeline ? "above" : "below"}`}>
        <div
          className={positioningClass}
          style={{
            left: `${position}%`,
            transform: "translateX(-50%)",
            zIndex: isExpanded ? 50 : 10,
          }}
        >
          <div
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 ${
              editingStage === stage.id ? "" : "cursor-pointer"
            } ${
              isCurrentPendingStage(stage, purchase)
                ? isExpanded
                  ? `w-64 p-4 shadow-xl hover:shadow-2xl z-50 border-2 ${getStatusBorderColor(purchaseStatus.type)}`
                  : `min-w-32 max-w-40 p-3 hover:shadow-md z-10 border-2 ${getStatusBorderColor(purchaseStatus.type)}`
                : isExpanded
                  ? "w-64 p-4 shadow-xl hover:shadow-2xl z-50 border border-gray-200"
                  : "min-w-32 max-w-40 p-3 hover:shadow-md z-10 border border-gray-200"
            }`}
            onClick={() => {
              // Don't trigger if already in edit mode
              if (editingStage === stage.id) {
                return;
              }
              onStageClick(stage);
            }}
          >
            {/* Collapsed Content */}
            {!isExpanded && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <h4 className="font-medium text-gray-800 text-xs leading-tight break-words">
                    {stage.name || "Unknown Stage"}
                  </h4>
                  {hasMultipleStagesWithSamePriority(stages, stage) && (
                    <Badge
                      variant={getPriorityVariant(stage.priority)}
                      className="ml-2 text-xs px-1 py-0 h-4 flex items-center bg-blue-100 text-blue-800 border-blue-200"
                    >
                      <Workflow className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
                {stage.completed && stage.stage_type.value_required && stage.value && stage.value.trim() !== "" && (
                  <div className="text-xs text-gray-900 font-medium mb-1 break-words">{stage.value}</div>
                )}
                {getStageDisplayDate(stage) && (
                  <div className="text-xs text-gray-500">{getStageDisplayDate(stage)}</div>
                )}
              </div>
            )}

            {/* Expanded Content */}
            {isExpanded && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-800 text-sm">{stage.name}</h4>
                      {hasMultipleStagesWithSamePriority(stages, stage) && (
                        <Badge
                          variant={getPriorityVariant(stage.priority)}
                          className="ml-2 text-xs px-1 py-0 h-4 flex items-center bg-blue-100 text-blue-800 border-blue-200"
                        >
                          <Workflow className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    {stage.stage_type.responsible_authority && (
                      <p className="text-xs text-gray-600 mt-1">
                        Responsible: {stage.stage_type.responsible_authority.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-3 h-3 rounded-full ${stage.completed ? "bg-green-500" : "bg-gray-300"}`} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseStagePopup();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editingStage === stage.id && (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Completion Date</label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {stage.stage_type.value_required && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Value</label>
                        <input
                          type="text"
                          value={editForm.text}
                          onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveStage(stage);
                        }}
                        disabled={isUpdatingStage}
                        className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        {isUpdatingStage ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCancel();
                        }}
                        disabled={isUpdatingStage}
                        className="flex items-center px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-800">{purchaseId}</h3>
              {isPurchaseComplete(purchase)
                ? (() => {
                    const daysAgo = calculateDaysSinceLastStageCompletion(purchase);
                    return (
                      <span className={`text-sm font-medium ${getStatusTextColor(purchaseStatus.type)}`}>
                        Purchase completed {daysAgo !== null ? `${daysAgo} days ago` : ""}
                      </span>
                    );
                  })()
                : getStagesText(purchase) && (
                    <span className={`text-sm font-medium ${getStatusTextColor(purchaseStatus.type)}`}>
                      {getStagesText(purchase)}
                      {purchase.pending_authority && ` (responsible: ${purchase.pending_authority.name})`}
                    </span>
                  )}
            </div>
            <div className="text-xs text-gray-500">Created: {formatDate(purchase.creation_date)}</div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Purchase</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {purchaseId}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeletePurchase(purchase.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="relative">
          {/* Timeline Container with dedicated areas */}
          <div className="relative px-4" id={`timeline-${purchase.id}`}>
            {/* Above Timeline Area */}
            <div className="relative h-28 mb-6">
              {stages.map((stage, index) => {
                const isAboveTimeline = index % 2 === 0;

                if (!isAboveTimeline) return null;

                return renderStageCard(stage, index, true);
              })}
            </div>

            {/* Timeline Line */}
            <div className="relative h-1">
              {(() => {
                const firstStagePosition = calculateStagePosition(stages, 0);
                const lastStagePosition = calculateStagePosition(stages, stages.length - 1);
                return (
                  <div
                    className="absolute top-1/2 h-0.5 bg-gray-300 -translate-y-1/2"
                    style={{
                      left: `${firstStagePosition}%`,
                      right: `${100 - lastStagePosition}%`,
                    }}
                  />
                );
              })()}

              {/* Stage Dots and Connecting Lines */}
              {stages.map((stage, index) => {
                const position = calculateStagePosition(stages, index);
                const isAboveTimeline = index % 2 === 0;
                return (
                  <div
                    key={`${stage.id}-dot`}
                    className="absolute top-1/2 transform -translate-y-1/2"
                    style={{
                      left: `${position}%`,
                      transform: "translateX(-50%) translateY(-50%)",
                    }}
                  >
                    {/* Connecting Line */}
                    <div
                      className="absolute w-0.5 bg-gray-200"
                      style={{
                        left: "50%",
                        transform: "translateX(-50%)",
                        ...(isAboveTimeline
                          ? { bottom: "0.5rem", height: "1.5rem" }
                          : { top: "0.5rem", height: "1.5rem" }),
                      }}
                    />

                    {/* Stage Dot */}
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center relative z-10 ${
                        stage.completed ? "bg-green-500 border-green-500" : "bg-white border-gray-300"
                      }`}
                    >
                      {stage.completed && <Check className="w-2 h-2 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Below Timeline Area */}
            <div className="relative h-28 mt-6">
              {stages.map((stage, index) => {
                const isAboveTimeline = index % 2 === 0;

                if (isAboveTimeline) return null;

                return renderStageCard(stage, index, false);
              })}
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="mt-6">
          <h5 className="text-base font-medium mb-2">Cost</h5>
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex flex-wrap gap-1">
              {purchase.costs.map((cost: any) => {
                return (
                  <Badge key={cost.id} variant="outline" className="text-sm">
                    {getCurrencySymbol(cost.currency)}
                    {cost.amount.toLocaleString()} {cost.currency}
                  </Badge>
                );
              })}
            </div>
            {/* Parallelism Explanation */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="w-3 h-3" />
              <span>
                <Workflow className="w-3 h-3 inline mr-1" />
                indicates stages that can run in parallel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add separator between purchases, but not after the last one */}
      {purchaseIndex < totalPurchases - 1 && (
        <div className="mt-6">
          <div className="border-t border-gray-200" />
        </div>
      )}
    </div>
  );
};
