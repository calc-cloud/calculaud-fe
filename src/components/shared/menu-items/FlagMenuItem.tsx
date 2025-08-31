import { Flag } from "lucide-react";
import React from "react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Purpose } from "@/types";

interface FlagMenuItemProps {
  purpose: Purpose;
  onToggleFlag: (purpose: Purpose) => void;
  onClose?: () => void;
  variant?: "dropdown" | "context";
}

export const FlagMenuItem: React.FC<FlagMenuItemProps> = ({
  purpose,
  onToggleFlag,
  onClose,
  variant = "dropdown"
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (variant === "context") {
      e.stopPropagation();
    }
    onToggleFlag(purpose);
    onClose?.();
  };

  const content = (
    <>
      <Flag className="mr-2 h-4 w-4" />
      {purpose.is_flagged ? "Unflag" : "Flag"}
    </>
  );

  if (variant === "context") {
    return (
      <div
        className="cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground flex"
        onClick={handleClick}
      >
        {content}
      </div>
    );
  }

  return (
    <DropdownMenuItem onClick={handleClick}>
      {content}
    </DropdownMenuItem>
  );
};