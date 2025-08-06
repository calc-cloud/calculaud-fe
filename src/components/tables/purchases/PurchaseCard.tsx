import React from "react";

import { Purchase } from "@/types";
import { formatPurchaseId, getPurchaseStatus, getStatusTextColor, getStatusBgColor } from "@/utils/purchaseUtils";

import { StatusIndicator } from "./StatusIndicator";

interface PurchaseCardProps {
  purchase: Purchase;
  compact?: boolean;
}

export const PurchaseCard: React.FC<PurchaseCardProps> = ({ purchase, compact = false }) => {
  const status = getPurchaseStatus(purchase);
  const purchaseId = formatPurchaseId(purchase.id);

  if (compact) {
    return (
      <div className="rounded-md p-2 border border-gray-200 bg-gray-50 transition-colors hover:shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600">{purchaseId}</span>
          <StatusIndicator status={status} variant="compact" />
        </div>
        <div className="text-xs text-gray-700 truncate" title={status.stageName}>
          {status.stageName}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-3 border-2 border-gray-200 bg-gray-50 transition-all hover:shadow-md text-gray-800">
      {/* Header with Purchase ID */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold">{purchaseId}</span>
        <StatusIndicator status={status} variant="compact" />
      </div>

      {/* Main content */}
      <div className="space-y-1">
        {status.days !== null && (
          <div className={`text-lg font-bold ${getStatusTextColor(status.type)}`}>
            {status.days} day{status.days !== 1 ? "s" : ""}
          </div>
        )}
        <div className="text-sm font-medium truncate" title={status.stageName}>
          {status.stageName}
        </div>
      </div>

      {/* Progress indicator for pending items */}
      {status.type !== "completed" && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div className={`h-1 rounded-full transition-all duration-300 ${getStatusBgColor(status.type)}`} />
        </div>
      )}
    </div>
  );
};
