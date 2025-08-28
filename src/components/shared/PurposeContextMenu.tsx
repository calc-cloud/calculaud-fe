import { Trash2, Flag } from "lucide-react";
import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Purpose } from "@/types";

interface PurposeContextMenuProps {
  purpose: Purpose;
  onToggleFlag: (purpose: Purpose) => void;
  onDeletePurpose: (purpose: Purpose) => void;
  trigger?: React.ReactNode;
  isContextMenu?: boolean;
  position?: { x: number; y: number };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PurposeContextMenu: React.FC<PurposeContextMenuProps> = ({
  purpose,
  onToggleFlag,
  onDeletePurpose,
  trigger,
  isContextMenu = false,
  position = { x: 0, y: 0 },
  open,
  onOpenChange,
}) => {
  const handleToggleFlag = () => {
    onToggleFlag(purpose);
    onOpenChange?.(false);
  };

  const handleDeletePurpose = () => {
    onDeletePurpose(purpose);
    onOpenChange?.(false);
  };

  const menuContent = (
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={handleToggleFlag}>
        <Flag className="mr-2 h-4 w-4" />
        {purpose.is_flagged ? "Unflag" : "Flag"}
      </DropdownMenuItem>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the purpose and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePurpose}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenuContent>
  );

  if (isContextMenu) {
    // For context menu, render a custom positioned menu
    return (
      <div
        className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        style={{
          left: position.x,
          top: position.y,
          display: open ? "block" : "none",
        }}
      >
        <div
          className="cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground flex"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFlag();
          }}
        >
          <Flag className="mr-2 h-4 w-4" />
          {purpose.is_flagged ? "Unflag" : "Flag"}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div
              className="cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground flex"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the purpose and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePurpose}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // For regular dropdown (purpose header), render with trigger
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      {menuContent}
    </DropdownMenu>
  );
};
