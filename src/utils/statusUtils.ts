import { PurposeStatus } from "@/types";

export interface StatusDisplayInfo {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
}

/**
 * Get display information for a purpose status including label, variant, and custom colors
 */
export const getStatusDisplay = (
  status: string | PurposeStatus
): StatusDisplayInfo => {
  switch (status) {
    case "IN_PROGRESS":
      return {
        label: "In Progress",
        variant: "outline",
        className:
          "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
      };
    case "COMPLETED":
      return {
        label: "Completed",
        variant: "outline",
        className:
          "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      };
    case "SIGNED":
      return {
        label: "Signed",
        variant: "outline",
        className:
          "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      };
    case "PARTIALLY_SUPPLIED":
      return {
        label: "Partially Supplied",
        variant: "outline",
        className:
          "bg-orange-200 text-orange-800 border-orange-300 hover:bg-orange-300",
      };
    default:
      return {
        label: status,
        variant: "outline",
        className:
          "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
      };
  }
};

/**
 * Get status display info from display format (used in filters)
 */
export const getStatusDisplayFromLabel = (
  displayLabel: string
): StatusDisplayInfo => {
  // Convert display label to API format first
  switch (displayLabel) {
    case "In Progress":
      return getStatusDisplay("IN_PROGRESS");
    case "Completed":
      return getStatusDisplay("COMPLETED");
    case "Signed":
      return getStatusDisplay("SIGNED");
    case "Partially Supplied":
      return getStatusDisplay("PARTIALLY_SUPPLIED");
    default:
      return getStatusDisplay(displayLabel);
  }
};
