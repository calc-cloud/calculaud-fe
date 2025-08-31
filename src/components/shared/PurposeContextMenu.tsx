import React from "react";

import { Purpose } from "@/types";

import { DeleteMenuItem } from "./menu-items/DeleteMenuItem";
import { FlagMenuItem } from "./menu-items/FlagMenuItem";

interface PurposeContextMenuProps {
  purpose: Purpose;
  onToggleFlag: (purpose: Purpose) => void;
  onDeletePurpose: (purpose: Purpose) => void;
  position: { x: number; y: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PurposeContextMenu: React.FC<PurposeContextMenuProps> = ({
  purpose,
  onToggleFlag,
  onDeletePurpose,
  position,
  open,
  onOpenChange,
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <FlagMenuItem purpose={purpose} onToggleFlag={onToggleFlag} onClose={handleClose} variant="context" />
      <DeleteMenuItem purpose={purpose} onDeletePurpose={onDeletePurpose} onClose={handleClose} variant="context" />
    </div>
  );
};
