import { Plus } from "lucide-react";
import React from "react";
import { useAuth } from "react-oidc-context";

import { StatusColorTooltip } from "@/components/common/StatusColorTooltip";
import { PurchaseTimeline } from "@/components/detail/PurchaseTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Purpose } from "@/types";
import { hasAdminRole } from "@/utils/roleUtils";

interface PurchasesTimelineCardProps {
  purpose: Purpose;
  onAddPurchase: () => void;
  onDeletePurchase: (purchaseId: string) => Promise<void>;
  onEditBudgetSource: (purchase: any) => void;
  onEditTimeline: (purchase: any) => void;
  // Stage editing props
  editingStage: number | null;
  selectedStage: any | null;
  editForm: { date: string; text: string };
  isUpdatingStage: boolean;
  onStageClick: (stage: any) => void;
  onEditCancel: () => void;
  onCloseStagePopup: () => void;
  onSaveStage: (stage: any) => Promise<void>;
  setEditForm: (form: { date: string; text: string }) => void;
  // Utility functions
  getStageDisplayDate: (stage: any) => string;
  hasMultipleStagesWithSamePriority: (stages: any[], stage: any) => boolean;
  getPriorityVariant: (priority: number) => "secondary" | "outline" | "default";
  isCurrentPendingStage: (stage: any, purchase: any) => boolean;
  calculateStagePosition: (stages: any[], stageIndex: number) => number;
  isPurchaseComplete: (purchase: any) => boolean;
}

export const PurchasesTimelineCard: React.FC<PurchasesTimelineCardProps> = ({
  purpose,
  onAddPurchase,
  onDeletePurchase,
  onEditBudgetSource,
  onEditTimeline,
  editingStage,
  selectedStage,
  editForm,
  isUpdatingStage,
  onStageClick,
  onEditCancel,
  onCloseStagePopup,
  onSaveStage,
  setEditForm,
  getStageDisplayDate,
  hasMultipleStagesWithSamePriority,
  getPriorityVariant,
  isCurrentPendingStage,
  calculateStagePosition,
  isPurchaseComplete,
}) => {
  const auth = useAuth();
  const isAdmin = hasAdminRole(auth.user);

  // Sort purchases - incomplete first, then completed
  const sortedPurchases = purpose.purchases.sort((a, b) => {
    const aComplete = isPurchaseComplete(a);
    const bComplete = isPurchaseComplete(b);

    if (aComplete === bComplete) {
      // If both are complete or both are incomplete, maintain original order
      return 0;
    }

    // Incomplete (false) comes before complete (true)
    return aComplete ? 1 : -1;
  });

  return (
    <Card className="flex-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <TooltipProvider>
            <StatusColorTooltip>
              <CardTitle className="text-lg font-semibold cursor-help">Purchases</CardTitle>
            </StatusColorTooltip>
          </TooltipProvider>
          {purpose.purchases.length > 0 && isAdmin && (
            <Button variant="outline" size="sm" onClick={onAddPurchase}>
              <Plus className="mr-2 h-4 w-4" />
              Add Purchase
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {purpose.purchases.length > 0 ? (
          <div className="space-y-8">
            {sortedPurchases.map((purchase, purchaseIndex) => (
              <PurchaseTimeline
                key={purchase.id}
                purchase={purchase}
                purchaseIndex={purchaseIndex}
                totalPurchases={sortedPurchases.length}
                editingStage={editingStage}
                selectedStage={selectedStage}
                editForm={editForm}
                isUpdatingStage={isUpdatingStage}
                onStageClick={onStageClick}
                onEditCancel={onEditCancel}
                onCloseStagePopup={onCloseStagePopup}
                onSaveStage={onSaveStage}
                onDeletePurchase={onDeletePurchase}
                onEditBudgetSource={onEditBudgetSource}
                onEditTimeline={onEditTimeline}
                setEditForm={setEditForm}
                isAdmin={isAdmin}
                getStageDisplayDate={getStageDisplayDate}
                hasMultipleStagesWithSamePriority={hasMultipleStagesWithSamePriority}
                getPriorityVariant={getPriorityVariant}
                isCurrentPendingStage={isCurrentPendingStage}
                calculateStagePosition={calculateStagePosition}
                isPurchaseComplete={isPurchaseComplete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-3 text-sm">No purchases yet</p>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={onAddPurchase}>
                <Plus className="mr-2 h-3 w-3" />
                Add First Purchase
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
