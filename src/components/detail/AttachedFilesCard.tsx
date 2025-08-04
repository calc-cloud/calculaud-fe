import React from "react";

import { FileUpload } from "@/components/common/FileUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Purpose, PurposeFile } from "@/types";

interface AttachedFilesCardProps {
  purpose: Purpose;
  onFilesChange: (newFiles: PurposeFile[]) => void;
}

export const AttachedFilesCard: React.FC<AttachedFilesCardProps> = ({
  purpose,
  onFilesChange,
}) => {
  return (
    <Card className="flex-none">
      <CardContent className="p-6">
        <FileUpload
          files={purpose.files}
          onFilesChange={onFilesChange}
          isReadOnly={false}
          purposeId={purpose.id}
        />
      </CardContent>
    </Card>
  );
};
