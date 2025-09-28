import { ArrowLeft, MoreVertical, Flag, FlagOff } from "lucide-react";
import React from "react";
import { useAuth } from "react-oidc-context";

import { PurposeDropdownMenu } from "@/components/shared/PurposeDropdownMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Purpose } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { hasAdminRole } from "@/utils/roleUtils";
import { getStatusDisplay } from "@/utils/statusUtils";

interface PurposeDetailHeaderProps {
  purpose: Purpose;
  onBackToSearch: () => void;
  onDeletePurpose: () => void;
  onToggleFlag: () => void;
}

export const PurposeDetailHeader: React.FC<PurposeDetailHeaderProps> = ({
  purpose,
  onBackToSearch,
  onDeletePurpose,
  onToggleFlag,
}) => {
  const auth = useAuth();
  const isAdmin = hasAdminRole(auth.user);
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
        {isAdmin && (
          <div className="group relative ml-2">
            <Flag
              className={`h-5 w-5 cursor-pointer transition-opacity duration-200 ${
                purpose.is_flagged
                  ? "opacity-100 text-red-500 fill-red-500 group-hover:opacity-0"
                  : "opacity-0 text-red-500 group-hover:opacity-100 group-hover:text-red-500"
              }`}
              onClick={onToggleFlag}
            />
            {purpose.is_flagged && (
              <FlagOff
                className="absolute top-0 left-0 h-5 w-5 cursor-pointer text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={onToggleFlag}
              />
            )}
          </div>
        )}
      </div>
      {isAdmin && (
        <PurposeDropdownMenu
          purpose={purpose}
          onToggleFlag={() => onToggleFlag()}
          onDeletePurpose={() => onDeletePurpose()}
          trigger={
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
        />
      )}
    </div>
  );
};
