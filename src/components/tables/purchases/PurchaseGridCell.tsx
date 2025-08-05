import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Purpose } from "@/types";

import { PurchaseCard } from "./PurchaseCard";

interface PurchaseGridCellProps {
  purpose: Purpose;
  maxVisible?: number;
}

export const PurchaseGridCell: React.FC<PurchaseGridCellProps> = ({ purpose, maxVisible = 4 }) => {
  const [showAll, setShowAll] = useState(false);

  // Sort purchases by days_since_last_completion in descending order (already done in getStagesDisplay)
  const sortedPurchases = [...purpose.purchases].sort((a, b) => {
    const daysA = a.days_since_last_completion ?? -1;
    const daysB = b.days_since_last_completion ?? -1;
    return daysB - daysA;
  });

  const visiblePurchases = showAll ? sortedPurchases : sortedPurchases.slice(0, maxVisible);
  const hasMore = sortedPurchases.length > maxVisible;

  // Generate tooltip content with purchase card style
  const tooltipContent = (
    <div className="flex flex-col space-y-2 min-w-64">
      {sortedPurchases.map((purchase) => (
        <PurchaseCard key={purchase.id} purchase={purchase} compact />
      ))}
    </div>
  );

  // Handle empty state
  if (sortedPurchases.length === 0) {
    return (
      <div className="text-center p-4">
        <div className="text-sm text-muted-foreground">No purchases added</div>
      </div>
    );
  }

  // Always use grid layout for consistency
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-full">
          <div className={`grid gap-2 ${sortedPurchases.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {visiblePurchases.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} compact />
            ))}
          </div>

          {/* Show more/less toggle */}
          {hasMore && (
            <div className="mt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAll(!showAll);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showAll ? "Show less" : `+${sortedPurchases.length - maxVisible} more`}
              </Button>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
};
