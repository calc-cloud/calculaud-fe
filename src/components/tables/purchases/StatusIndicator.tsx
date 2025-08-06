import React from "react";

import { Badge } from "@/components/ui/badge";
import { PurchaseStatus } from "@/utils/purchaseUtils";

interface StatusIndicatorProps {
  status: PurchaseStatus;
  variant?: "default" | "compact";
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, variant = "default" }) => {
  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} border border-current`}
      >
        {status.days !== null ? `${status.days}d` : status.type === "completed" ? "✓" : "⏳"}
      </div>
    );
  }

  return (
    <Badge variant="outline" className={`${status.bgColor} ${status.textColor} border-current font-medium`}>
      {status.type === "completed" ? "Completed" : status.days !== null ? `${status.days} days` : "Waiting"}
    </Badge>
  );
};
