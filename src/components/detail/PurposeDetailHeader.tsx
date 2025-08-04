import { ArrowLeft, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Purpose } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { getStatusDisplay } from "@/utils/statusUtils";

interface PurposeDetailHeaderProps {
  purpose: Purpose;
  onBackToSearch: () => void;
  onDeletePurpose: () => void;
}

export const PurposeDetailHeader: React.FC<PurposeDetailHeaderProps> = ({
  purpose,
  onBackToSearch,
  onDeletePurpose,
}) => {
  const statusInfo = getStatusDisplay(purpose.status);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBackToSearch}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purpose Details</h1>
          <p className="text-sm text-gray-500">Created {formatDate(purpose.creation_time)}</p>
        </div>
        <Badge variant={statusInfo.variant} className={`cursor-default pointer-events-none ${statusInfo.className}`}>
          {statusInfo.label}
        </Badge>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Purpose
          </Button>
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
              onClick={onDeletePurpose}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
