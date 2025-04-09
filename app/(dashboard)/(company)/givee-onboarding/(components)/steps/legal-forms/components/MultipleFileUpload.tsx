"use client";

import { useState, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, FileIcon, FileText, Upload, Plus } from "lucide-react";
import { FileDisplayItem } from "./FileDisplayItem";
import { OnboardingFileMetadata } from "../../../types";

interface MultipleFileUploadProps {
  folder: string;
  subsidiaryId: string;
  onUploadComplete: (fileData: OnboardingFileMetadata) => void;
  onRemove: (filePath: string) => void;
  existingFiles?: OnboardingFileMetadata[];
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  label?: string;
  bucket?: string;
}

export const MultipleFileUpload: React.FC<MultipleFileUploadProps> = ({
  folder,
  subsidiaryId,
  onUploadComplete,
  onRemove,
  existingFiles = [],
  acceptedFileTypes = "application/pdf,image/*",
  maxSizeMB = 10,
  label = "Dateien hochladen",
  bucket = "givve_documents",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

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

      setUploadProgress(100);

      // Call the callback with the file data
      onUploadComplete({
        fileName: file.name,
        filePath: filePath,
        fileType: file.type,
        fileSize: file.size,
        signedUrl: urlData.signedUrl,
        uploadedAt: new Date().toISOString(),
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

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
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (file: OnboardingFileMetadata) => {
    try {
      // Delete file from Supabase
      const { error } = await supabase.storage
        .from(bucket)
        .remove([file.filePath]);

      if (error) {
        throw error;
      }

      // Call the callback
      onRemove(file.filePath);

      toast({
        title: "Datei entfernt",
        description: "Die Datei wurde erfolgreich entfernt.",
      });
    } catch (error: any) {
      console.error("Error removing file:", error);
      toast({
        title: "Fehler beim Entfernen",
        description: error.message || "Die Datei konnte nicht entfernt werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Display existing files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((file, index) => (
            <FileDisplayItem
              key={file.filePath || index}
              file={file}
              onRemove={() => handleRemove(file)}
              showPreview={true}
            />
          ))}
        </div>
      )}

      {/* Upload new file button */}
      <div className="flex flex-col space-y-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id="multiple-file-upload"
        />

        {isUploading ? (
          <div className="flex h-10 w-full flex-col items-center justify-center rounded-md border p-2">
            <Progress value={uploadProgress} className="h-2 w-full" />
            <p className="mt-1 text-xs text-muted-foreground">
              Wird hochgeladen... ({uploadProgress}%)
            </p>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {label}
          </Button>
        )}
      </div>
    </div>
  );
};
