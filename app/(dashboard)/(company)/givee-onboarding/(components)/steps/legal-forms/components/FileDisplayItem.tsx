import React from "react";
import { X, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingFileMetadata } from "../../../types";

interface FileDisplayItemProps {
  file: OnboardingFileMetadata;
  onRemove?: () => void;
  showPreview?: boolean;
}

export const FileDisplayItem: React.FC<FileDisplayItemProps> = ({
  file,
  onRemove,
  showPreview = true,
}) => {
  const handlePreview = () => {
    if (file.signedUrl) {
      window.open(file.signedUrl, "_blank");
    }
  };

  return (
    <div className="my-1 flex w-full items-center gap-2 rounded-md bg-muted/30 p-2">
      <FileText className="h-5 w-5 text-primary/70" />

      <div className="flex-1 truncate text-sm">
        {file.fileName}
        <p className="text-xs text-muted-foreground">
          {(file.fileSize / 1024).toFixed(2)} KB
        </p>
      </div>

      <div className="flex gap-1">
        {showPreview && file.signedUrl && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePreview}
            title="Vorschau anzeigen"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}

        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={onRemove}
            title="Datei entfernen"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
