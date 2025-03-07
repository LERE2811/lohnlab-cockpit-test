"use client";

import { useDocumentUrl } from "@/hooks/use-document-url";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ExternalLink,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface ImagePreviewProps {
  filePath: string | null | undefined;
  fileName?: string;
  className?: string;
  maxHeight?: number;
  showFileName?: boolean;
}

export const ImagePreview = ({
  filePath,
  fileName = "Image",
  className = "",
  maxHeight = 200,
  showFileName = true,
}: ImagePreviewProps) => {
  const { url, isLoading, error } = useDocumentUrl(filePath);

  if (!filePath) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !url) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6 text-center text-destructive">
          Fehler beim Laden des Bildes
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="overflow-hidden">
        {showFileName && (
          <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="truncate text-sm font-medium">{fileName}</span>
          </div>
        )}
        <CardContent className="p-0">
          <div className="relative flex items-center justify-center overflow-hidden bg-muted/20 p-4">
            <Image
              src={url}
              alt={fileName}
              width={400}
              height={maxHeight}
              className="rounded-sm object-contain"
              style={{ maxHeight: `${maxHeight}px` }}
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          In neuem Tab öffnen
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href={url}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="mr-2 h-4 w-4" />
            Herunterladen
          </a>
        </Button>
      </div>
    </div>
  );
};
