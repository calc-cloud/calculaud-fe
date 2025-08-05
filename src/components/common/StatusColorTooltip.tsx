import React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STATUS_COLORS } from "@/utils/purchaseUtils";

interface StatusColorTooltipProps {
  children: React.ReactNode;
}

/**
 * Status color tooltip component for purchase status legend
 */
export const StatusColorTooltip: React.FC<StatusColorTooltipProps> = ({ children }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-2">
          <div className="font-medium text-sm">Purchase Status Colors:</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${STATUS_COLORS.recent.bg} flex-shrink-0`} />
              <span>Recent (≤6 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${STATUS_COLORS.warning.bg} flex-shrink-0`} />
              <span>Warning (7-30 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${STATUS_COLORS.critical.bg} flex-shrink-0`} />
              <span>Critical (&gt;30 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${STATUS_COLORS.completed.bg} flex-shrink-0`} />
              <span>Completed</span>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};