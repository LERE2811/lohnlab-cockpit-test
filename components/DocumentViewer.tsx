"use client";

import { useDocumentUrl } from "@/hooks/use-document-url";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ExternalLink, Download } from "lucide-react";

interface DocumentViewerProps {
  filePath: string | null | undefined;
  fileName?: string;
  className?: string;
}

export const DocumentViewer = ({
  filePath,
  fileName = "Document",
  className = "",
}: DocumentViewerProps) => {
  const { url, isLoading, error } = useDocumentUrl(filePath);

  if (!filePath) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Dokument wird geladen...</span>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className={`text-destructive ${className}`}>
        Fehler beim Laden des Dokuments
      </div>
    );
  }

  const isPdf = fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <FileText className="h-5 w-5" />
        <span className="font-medium">{fileName}</span>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Öffnen
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
      {isPdf && (
        <div className="mt-4 rounded border">
          <iframe
            src={`${url}#toolbar=0`}
            className="h-[400px] w-full"
            title={fileName}
          />
        </div>
      )}
    </div>
  );
};
