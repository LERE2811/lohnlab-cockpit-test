"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  X,
  FileIcon,
  ImageIcon,
  FileText,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { FileDisplayItem } from "@/app/(dashboard)/(company)/givee-onboarding/(components)/steps/legal-forms/components";

interface FileUploadProps {
  folder: string;
  subsidiaryId: string;
  onUploadComplete: (fileData: {
    signedUrl: string;
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => void;
  onRemove: () => void;
  existingFileUrl?: string;
  existingFilePath?: string;
  existingFileName?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  label?: string;
  bucket?: string;
  allowMultiple?: boolean;
}

export const FileUpload = ({
  folder,
  subsidiaryId,
  onUploadComplete,
  onRemove,
  existingFileUrl,
  existingFilePath,
  existingFileName,
  acceptedFileTypes = "image/*,application/pdf",
  maxSizeMB = 10,
  label = "Upload File",
  bucket = "onboarding_documents",
  allowMultiple = false,
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<string | null>(
    existingFileUrl || null,
  );
  const [fileName, setFileName] = useState<string | null>(
    existingFileName || null,
  );
  const [filePath, setFilePath] = useState<string | null>(
    existingFilePath || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update internal state when props change
  useEffect(() => {
    if (existingFileUrl) {
      setFilePreview(existingFileUrl);
    }
    if (existingFileName) {
      setFileName(existingFileName);
    }
    if (existingFilePath) {
      setFilePath(existingFilePath);
    }
  }, [existingFileUrl, existingFileName, existingFilePath]);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const isImage = (fileType: string) => fileType.startsWith("image/");
  const isPdf = (fileType: string) => fileType === "application/pdf";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeBytes) {
      toast({
        title: "Datei zu groß",
        description: `Die maximale Dateigröße beträgt ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a file preview
      if (isImage(file.type)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFilePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }

      setFileName(file.name);

      // Simulate progress (in a real implementation, you'd use Supabase's upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Upload file to Supabase
      const fileExt = file.name.split(".").pop();
      const filePath = `${folder}/${subsidiaryId}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Generate signed URL (valid for 1 hour)
      const { data: urlData, error: urlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600);

      if (urlError) {
        throw urlError;
      }

      setFilePath(filePath);
      setUploadProgress(100);

      // Call the callback with the file data
      onUploadComplete({
        signedUrl: urlData.signedUrl,
        filePath: filePath,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      toast({
        title: "Datei hochgeladen",
        description: "Die Datei wurde erfolgreich hochgeladen.",
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Fehler beim Hochladen",
        description:
          error.message || "Die Datei konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
      setFilePreview(null);
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (filePath) {
      try {
        // Delete file from Supabase
        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (error) {
          throw error;
        }

        toast({
          title: "Datei entfernt",
          description: "Die Datei wurde erfolgreich entfernt.",
        });
      } catch (error: any) {
        console.error("Error removing file:", error);
        toast({
          title: "Fehler beim Entfernen",
          description:
            error.message || "Die Datei konnte nicht entfernt werden.",
          variant: "destructive",
        });
      }
    }

    // Reset state
    setFilePreview(null);
    setFileName(null);
    setFilePath(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Call the callback
    onRemove();
  };

  const renderFilePreview = () => {
    // If we have an existing file but no preview generated yet, try to determine the type
    const isExistingFile = fileName && !isUploading && !filePreview;
    const fileType = existingFileUrl
      ?.split("?")[0]
      ?.split(".")
      .pop()
      ?.toLowerCase();
    const isPdfFile = fileType === "pdf" || existingFileUrl?.includes("pdf");
    const isImageFile = ["jpg", "jpeg", "png", "gif", "webp"].includes(
      fileType || "",
    );

    if (isUploading) {
      return (
        <div className="flex h-24 w-full flex-col items-center justify-center rounded-md border border-dashed p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Wird hochgeladen... ({uploadProgress}%)
          </p>
          <Progress value={uploadProgress} className="mt-2 h-2 w-full" />
        </div>
      );
    }

    if (filePreview && isImage(fileName?.split(".").pop() || "")) {
      return (
        <div className="relative">
          <div className="relative h-40 w-full overflow-hidden rounded-md border">
            <Image
              src={filePreview}
              alt="File preview"
              fill
              className="object-contain"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
            onClick={() => {
              onRemove();
              handleRemove();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    if (isPdfFile || isPdf(fileName?.split(".").pop() || "")) {
      return (
        <div className="relative">
          <div className="flex h-24 w-full items-center rounded-md border bg-muted/20 p-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">PDF Dokument</p>
              {existingFileUrl && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 h-6 p-0 text-primary"
                  onClick={() => window.open(existingFileUrl, "_blank")}
                >
                  Dokument ansehen
                </Button>
              )}
            </div>
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
            onClick={() => {
              onRemove();
              handleRemove();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    if (isExistingFile || fileName) {
      return (
        <div className="relative">
          <div className="flex h-24 w-full items-center rounded-md border bg-muted/20 p-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
              <FileIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">Dokument</p>
              {existingFileUrl && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 h-6 p-0 text-primary"
                  onClick={() => window.open(existingFileUrl, "_blank")}
                >
                  Dokument ansehen
                </Button>
              )}
            </div>
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
            onClick={() => {
              onRemove();
              handleRemove();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 transition-colors hover:bg-muted/50"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      </div>
    );
  };

  return (
    <div>
      {!fileName ? (
        <div className="flex flex-col space-y-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id="file-upload"
            multiple={allowMultiple}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {label}
          </Button>
        </div>
      ) : (
        renderFilePreview()
      )}
    </div>
  );
};
