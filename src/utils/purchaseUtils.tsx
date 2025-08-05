import React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Purchase } from "@/types";

// Centralized color mapping for purchase status
export const STATUS_COLORS = {
  critical: {
    bg: "bg-rose-400",
    text: "text-rose-600",
    border: "border-rose-400",
  },
  warning: {
    bg: "bg-amber-400", 
    text: "text-amber-600",
    border: "border-amber-400",
  },
  completed: {
    bg: "bg-green-400",
    text: "text-green-600", 
    border: "border-green-400",
  },
  recent: {
    bg: "bg-sky-400",
    text: "text-sky-600",
    border: "border-sky-400",
  },
} as const;

export interface PurchaseStatus {
  type: "critical" | "warning" | "completed" | "recent";
  label: string;
  days: number | null;
  stageName: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

/**
 * Get purchase status information including color coding and display text
 */
export const getPurchaseStatus = (purchase: Purchase): PurchaseStatus => {
  const days = purchase.days_since_last_completion;

  // Check if purchase is completed
  const isCompleted = purchase.flow_stages?.every((stage) => stage.completion_date) ?? false;

  if (isCompleted) {
    return {
      type: "completed",
      label: days !== null ? `Completed ${days} days ago` : "Completed",
      days,
      stageName: "Completed",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-300",
    };
  }

  // Get current pending stage name
  const pendingStages = purchase.current_pending_stages || [];
  const stageName =
    pendingStages.length > 0
      ? pendingStages.map((stage) => stage.stage_type?.display_name || stage.stage_type?.name).join(", ")
      : "Pending";

  if (days === null) {
    return {
      type: "recent",
      label: `Waiting for ${stageName}`,
      days: null,
      stageName,
      bgColor: "bg-slate-100",
      textColor: "text-slate-600",
      borderColor: "border-slate-300",
    };
  }

  // Color coding based on days pending
  if (days > 30) {
    return {
      type: "critical",
      label: `${days} days in ${stageName}`,
      days,
      stageName,
      bgColor: "bg-rose-100",
      textColor: "text-rose-600",
      borderColor: "border-rose-300",
    };
  } else if (days >= 7) {
    return {
      type: "warning",
      label: `${days} days in ${stageName}`,
      days,
      stageName,
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
      borderColor: "border-amber-300",
    };
  } else {
    return {
      type: "recent",
      label: `${days} days in ${stageName}`,
      days,
      stageName,
      bgColor: "bg-sky-100",
      textColor: "text-sky-600",
      borderColor: "border-sky-300",
    };
  }
};

/**
 * Format purchase ID for display (e.g., "#1", "#2")
 */
export const formatPurchaseId = (purchaseId: number): string => {
  return `#${purchaseId}`;
};

/**
 * Get priority indicator based on status type
 */
export const getPriorityIcon = (statusType: PurchaseStatus["type"]): string => {
  switch (statusType) {
    case "critical":
      return "🔴";
    case "warning":
      return "🟡";
    case "completed":
      return "🟢";
    case "recent":
    default:
      return "⚪";
  }
};

/**
 * Get the text color class for a purchase status
 */
export const getStatusTextColor = (statusType: PurchaseStatus["type"]): string => {
  return STATUS_COLORS[statusType]?.text || STATUS_COLORS.recent.text;
};

/**
 * Get the border color class for a purchase status
 */
export const getStatusBorderColor = (statusType: PurchaseStatus["type"]): string => {
  return STATUS_COLORS[statusType]?.border || STATUS_COLORS.recent.border;
};

/**
 * Get the background color class for progress indicators
 */
export const getStatusBgColor = (statusType: PurchaseStatus["type"]): string => {
  return STATUS_COLORS[statusType]?.bg || STATUS_COLORS.recent.bg;
};

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
