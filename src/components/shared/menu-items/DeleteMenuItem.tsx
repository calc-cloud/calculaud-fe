import { Trash2 } from "lucide-react";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Purpose } from "@/types";

interface DeleteMenuItemProps {
  purpose: Purpose;
  onDeletePurpose: (purpose: Purpose) => void;
  onClose?: () => void;
  variant?: "dropdown" | "context";
}

export const DeleteMenuItem: React.FC<DeleteMenuItemProps> = ({
  purpose,
  onDeletePurpose,
  onClose,
  variant = "dropdown",
}) => {
  const handleDelete = () => {
    onDeletePurpose(purpose);
    onClose?.();
  };

  const triggerContent = (
    <>
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </>
  );

  const dialogContent = (
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
          onClick={handleDelete}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (variant === "context") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div
            className="cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground flex"
            onClick={(e) => e.stopPropagation()}
          >
            {triggerContent}
          </div>
        </AlertDialogTrigger>
        {dialogContent}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>{triggerContent}</DropdownMenuItem>
      </AlertDialogTrigger>
      {dialogContent}
    </AlertDialog>
  );
};
