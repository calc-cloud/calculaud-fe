import { Purchase } from "@/types";

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
  const isCompleted = purchase.flow_stages?.every(stage => stage.completion_date) ?? false;
  
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
  const stageName = pendingStages.length > 0 
    ? pendingStages.map(stage => stage.stage_type?.display_name || stage.stage_type?.name).join(", ")
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