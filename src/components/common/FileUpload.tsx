import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  Download,
  FileImage,
  FileSpreadsheet,
  FileType,
  File,
  MoreVertical,
} from "lucide-react";
import React, { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { purposeService } from "@/services/purposeService";
import { PurposeFile } from "@/types";
import { formatDate } from "@/utils/dateUtils";

interface FileUploadProps {
  files: PurposeFile[];
  onFilesChange: (files: PurposeFile[]) => void;
  isReadOnly: boolean;
  purposeId: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  isReadOnly,
  purposeId,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);

    // Track which files are being uploaded
    const uploadIds = Array.from(
      { length: fileArray.length },
      () => `upload-${Date.now()}-${Math.random()}`
    );
    setUploadingFiles(new Set(uploadIds));

    try {
      // Upload files sequentially to avoid overwhelming the server
      const uploadPromises = fileArray.map(async (file) => {
        try {
          const response = await purposeService.uploadFile(purposeId, file);
          return {
            id: response.id.toString(),
            purpose_id: purposeId,
            filename: response.original_filename,
            file_url: response.file_url,
            upload_date: response.uploaded_at,
            file_size: response.file_size,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}: ${errorMessage}`,
            variant: "destructive",
          });
          return null;
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter(
        (file): file is PurposeFile => file !== null
      );

      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
        toast({
          title: "Files uploaded",
          description: `${validFiles.length} file(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Upload failed",
        description: `Failed to upload files: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(new Set());
      // Clear the input value to allow re-uploading the same file
      event.target.value = "";
    }
  };

  const removeFile = async (fileId: string) => {
    setDeletingFiles((prev) => new Set([...prev, fileId]));

    try {
      await purposeService.deleteFile(purposeId, fileId);
      onFilesChange(files.filter((file) => file.id !== fileId));
      toast({
        title: "File deleted",
        description: "File deleted successfully.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Delete failed",
        description: `Failed to delete file: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleDownload = (file: PurposeFile) => {
    if (file.file_url) {
      const link = document.createElement("a");
      link.href = file.file_url;
      link.download = file.filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (filename: string) => {
    const extension = filename?.toLowerCase().split(".").pop() || "";

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
        return <FileImage className="h-5 w-5 text-blue-500" />;
      case "pdf":
        return <FileType className="h-5 w-5 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case "txt":
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const isImageFile = (filename: string) => {
    const extension = filename?.toLowerCase().split(".").pop() || "";
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension);
  };

  const FilePreview: React.FC<{ file: PurposeFile }> = ({ file }) => {
    const [imageError, setImageError] = useState(false);

    if (isImageFile(file.filename || "") && file.file_url && !imageError) {
      return (
        <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
          <img
            src={file.file_url}
            alt={file.filename || "File preview"}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-md border border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50">
        {getFileIcon(file.filename || "")}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Attachments</h3>
        {!isReadOnly && (
          <>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
              disabled={uploadingFiles.size > 0}
            />

            {/* Upload button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={uploadingFiles.size > 0}
            >
              {uploadingFiles.size > 0 ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploadingFiles.size > 0 ? "Uploading..." : "Upload Files"}
            </Button>
          </>
        )}
      </div>

      {files.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-6">
            <div className="text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                No files uploaded yet.
              </p>
              {!isReadOnly && (
                <p className="text-muted-foreground text-xs mt-1">
                  Click "Upload Files" to add attachments.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <Card key={file.id || `file-${index}`}>
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FilePreview file={file} />
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-medium text-sm truncate max-w-[200px]"
                      title={file.filename || "Unknown file"}
                    >
                      {file.filename || "Unknown file"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(file.upload_date)}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    {!isReadOnly && (
                      <DropdownMenuItem
                        onClick={() => removeFile(file.id)}
                        disabled={deletingFiles.has(file.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        {deletingFiles.has(file.id) ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        {deletingFiles.has(file.id) ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
