import React from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Purpose } from "@/types";

import { DeleteMenuItem } from "./menu-items/DeleteMenuItem";
import { FlagMenuItem } from "./menu-items/FlagMenuItem";

interface PurposeDropdownMenuProps {
  purpose: Purpose;
  onToggleFlag: (purpose: Purpose) => void;
  onDeletePurpose: (purpose: Purpose) => void;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PurposeDropdownMenu: React.FC<PurposeDropdownMenuProps> = ({
  purpose,
  onToggleFlag,
  onDeletePurpose,
  trigger,
  open,
  onOpenChange,
}) => {
  const handleClose = () => {
    onOpenChange?.(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <FlagMenuItem purpose={purpose} onToggleFlag={onToggleFlag} onClose={handleClose} variant="dropdown" />
        <DeleteMenuItem purpose={purpose} onDeletePurpose={onDeletePurpose} onClose={handleClose} variant="dropdown" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
