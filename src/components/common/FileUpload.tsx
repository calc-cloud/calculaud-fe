
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { PurposeFile } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface FileUploadProps {
  files: PurposeFile[];
  onFilesChange: (files: PurposeFile[]) => void;
  isReadOnly: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  isReadOnly
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: PurposeFile[] = Array.from(selectedFiles).map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      purpose_id: '',
      filename: file.name,
      file_url: URL.createObjectURL(file), // Temporary URL for preview
      upload_date: new Date().toISOString(),
      file_size: file.size
    }));

    onFilesChange([...files, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Attachments</h3>
        {!isReadOnly && (
          <div className="relative">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
            />
          </div>
        )}
      </div>

      {files.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-6">
            <div className="text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No files uploaded yet.</p>
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
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{file.filename}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(file.upload_date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {file.filename.split('.').pop()?.toUpperCase()}
                  </Badge>
                  {!isReadOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
