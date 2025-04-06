"use client";

import { useState, useRef } from "react";
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
    if (!filePreview && !fileName) {
      return null;
    }

    return (
      <div className="mt-4 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {filePreview && isImage(fileName?.split(".").pop() || "") ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-md">
                <Image
                  src={filePreview}
                  alt="File preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : isPdf(fileName?.split(".").pop() || "") ? (
              <FileText className="h-10 w-10 text-primary" />
            ) : (
              <FileIcon className="h-10 w-10 text-primary" />
            )}
            <div>
              <p className="text-sm font-medium">{fileName}</p>
              {isUploading ? (
                <p className="text-xs text-muted-foreground">Uploading...</p>
              ) : (
                <p className="text-xs text-muted-foreground">Uploaded</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {isUploading && (
          <Progress value={uploadProgress} className="mt-2 h-1" />
        )}
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
