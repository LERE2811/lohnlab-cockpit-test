"use client";

import { StepLayout } from "../components/StepLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckSquare, FileWarning, FileCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGivveOnboarding } from "../context/givve-onboarding-context";
import { useCompany } from "@/context/company-context";
import { useState, useEffect } from "react";
import {
  DocumentFileMetadata,
  GivveDocumentCategory,
  GivveDocumentType,
  uploadGivveDocument,
} from "../utils/uploadDocuments";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/utils/supabase/client";

interface FileMetadata {
  signedUrl: string;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export const SignedFormsStep = () => {
  const { formData, updateFormData, saveProgress, nextStep } =
    useGivveOnboarding();
  const { subsidiary } = useCompany();
  const { toast } = useToast();

  const [bestellformularMetadata, setBestellformularMetadata] =
    useState<FileMetadata | null>(null);
  const [dokumentationsbogenMetadata, setDokumentationsbogenMetadata] =
    useState<FileMetadata | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Load existing file metadata from formData on component mount
  useEffect(() => {
    if (formData?.documents?.signedForms) {
      const { bestellformular, dokumentationsbogen } =
        formData.documents.signedForms;

      if (bestellformular) {
        setBestellformularMetadata({
          signedUrl: bestellformular.signedUrl,
          filePath: bestellformular.filePath,
          fileName: bestellformular.fileName,
          fileType: bestellformular.fileType,
          fileSize: bestellformular.fileSize,
        });
      }

      if (dokumentationsbogen) {
        setDokumentationsbogenMetadata({
          signedUrl: dokumentationsbogen.signedUrl,
          filePath: dokumentationsbogen.filePath,
          fileName: dokumentationsbogen.fileName,
          fileType: dokumentationsbogen.fileType,
          fileSize: dokumentationsbogen.fileSize,
        });
      }
    }
  }, [formData]);

  const handleBestellformularUpload = (fileData: FileMetadata) => {
    setBestellformularMetadata(fileData);
  };

  const handleDokumentationsbogenUpload = (fileData: FileMetadata) => {
    setDokumentationsbogenMetadata(fileData);
  };

  const handleBestellformularRemove = () => {
    setBestellformularMetadata(null);
  };

  const handleDokumentationsbogenRemove = () => {
    setDokumentationsbogenMetadata(null);
  };

  const handleContinue = async () => {
    if (!subsidiary?.id) {
      toast({
        title: "Fehler",
        description: "Fehlende Unternehmens-ID",
        variant: "destructive",
      });
      return;
    }

    if (!bestellformularMetadata && !dokumentationsbogenMetadata) {
      toast({
        title: "Fehler",
        description: "Bitte laden Sie mindestens ein Dokument hoch",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Files are already uploaded by the FileUpload component
      // Just update the form data with the metadata
      const updatedDocuments = {
        ...(formData.documents || {}),
        signedForms: {
          bestellformular: bestellformularMetadata
            ? {
                fileName: bestellformularMetadata.fileName,
                filePath: bestellformularMetadata.filePath,
                fileType: bestellformularMetadata.fileType,
                fileSize: bestellformularMetadata.fileSize,
                uploadedAt: new Date().toISOString(),
                signedUrl: bestellformularMetadata.signedUrl,
              }
            : undefined,
          dokumentationsbogen: dokumentationsbogenMetadata
            ? {
                fileName: dokumentationsbogenMetadata.fileName,
                filePath: dokumentationsbogenMetadata.filePath,
                fileType: dokumentationsbogenMetadata.fileType,
                fileSize: dokumentationsbogenMetadata.fileSize,
                uploadedAt: new Date().toISOString(),
                signedUrl: dokumentationsbogenMetadata.signedUrl,
              }
            : undefined,
          uploadedAt: new Date().toISOString(),
        },
      };

      // Update subsidiary record to mark documents as submitted
      const { error: updateError } = await supabase
        .from("subsidiaries")
        .update({
          givve_order_forms_downloaded: true,
          givve_documentation_forms_downloaded: true,
        })
        .eq("id", subsidiary.id);

      if (updateError) {
        console.error("Error updating subsidiary record:", updateError);
      }

      // Update local state
      updateFormData({
        documents: updatedDocuments,
        documentsSubmitted: true,
      });

      // Save progress and move to next step
      await saveProgress({
        documents: updatedDocuments,
        documentsSubmitted: true,
      });

      setUploadSuccess(true);

      toast({
        title: "Erfolg",
        description: "Dokumente wurden erfolgreich gespeichert",
      });

      // Proceed to next step after a short delay
      setTimeout(() => {
        nextStep();
      }, 1500);
    } catch (error) {
      console.error("Error saving signed forms:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern der Dokumente",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filesUploaded = bestellformularMetadata || dokumentationsbogenMetadata;

  return (
    <StepLayout
      title="Formulare unterschrieben"
      description="Laden Sie die unterschriebenen Dokumente hoch"
      onSave={handleContinue}
      saveButtonText="Weiter zum nächsten Schritt"
      disableNext={
        isUploading ||
        (!bestellformularMetadata && !dokumentationsbogenMetadata)
      }
    >
      <div className="space-y-6">
        {uploadSuccess ? (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <FileCheck className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              Dokumente wurden erfolgreich gespeichert. Sie werden zur nächsten
              Seite weitergeleitet...
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <FileWarning className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Bitte laden Sie die ausgefüllten und unterschriebenen Dokumente
              hoch. Die Dokumente werden anschließend an givve® weitergeleitet.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckSquare className="mr-2 h-5 w-5 text-primary" />
                Bestellformular
              </CardTitle>
              <CardDescription>
                Das unterschriebene Bestellformular für die givve® Card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                folder={`givve_documents/${subsidiary?.id}/${GivveDocumentCategory.SIGNED_FORMS}/${GivveDocumentType.BESTELLFORMULAR}`}
                subsidiaryId={subsidiary?.id || ""}
                onUploadComplete={handleBestellformularUpload}
                onRemove={handleBestellformularRemove}
                existingFileUrl={bestellformularMetadata?.signedUrl}
                existingFilePath={bestellformularMetadata?.filePath}
                existingFileName={bestellformularMetadata?.fileName}
                acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                maxSizeMB={10}
                label="Bestellformular hochladen"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckSquare className="mr-2 h-5 w-5 text-primary" />
                Dokumentationsbogen
              </CardTitle>
              <CardDescription>
                Der unterschriebene Dokumentationsbogen gem. Geldwäschegesetz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                folder={`givve_documents/${subsidiary?.id}/${GivveDocumentCategory.SIGNED_FORMS}/${GivveDocumentType.DOKUMENTATIONSBOGEN}`}
                subsidiaryId={subsidiary?.id || ""}
                onUploadComplete={handleDokumentationsbogenUpload}
                onRemove={handleDokumentationsbogenRemove}
                existingFileUrl={dokumentationsbogenMetadata?.signedUrl}
                existingFilePath={dokumentationsbogenMetadata?.filePath}
                existingFileName={dokumentationsbogenMetadata?.fileName}
                acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                maxSizeMB={10}
                label="Dokumentationsbogen hochladen"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </StepLayout>
  );
};
