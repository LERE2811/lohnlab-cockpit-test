"use client";

import { StepLayout } from "../components/StepLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, FileWarning, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGivveOnboarding } from "../context/givve-onboarding-context";
import { useCompany } from "@/context/company-context";
import { useState, useEffect } from "react";
import {
  GmbHForm,
  AGForm,
  OtherForm,
  GmbHCoKGForm,
  KgOhgForm,
  KdoerForm,
  GmbHUGForm,
  PartGForm,
  VereinGenossForm,
  EkForm,
  EinzelunternehmenForm,
  FreiberuflerForm,
  JuristischePersonForm,
  GbrForm,
} from "./legal-forms";
import {
  uploadLegalFormDocuments,
  prepareDocumentsForSaving,
} from "../utils/uploadLegalFormDocuments";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Clock, Loader2 } from "lucide-react";
import { OnboardingFileMetadata } from "../types";

// Define a custom File type for use in this component
interface CustomFile extends File {
  name: string;
  size: number;
  type: string;
}

// Define the available legal forms
const LegalForm = {
  GMBH: "GmbH",
  UG: "UG",
  AG: "AG",
  EK: "e.K.",
  EINZELUNTERNEHMEN: "Einzelunternehmen",
  FREIBERUFLER: "Freiberufler",
  JURISTISCHE_PERSON: "juristische Person",
  OHG: "OHG",
  KG: "KG",
  GMBH_CO_KG: "GmbH & Co. KG",
  PARTG: "PartG",
  PARTG_MBB: "PartG mbB",
  VEREIN: "e.V.",
  GENOSSENSCHAFT: "eG",
  KDOER: "KdöR",
  GBR: "GbR",
  SONSTIGE: "Sonstige",
} as const;

type DocumentFormData = {
  [key: string]: CustomFile[] | OnboardingFileMetadata[] | string | boolean;
};

export const RequiredDocumentsStep = () => {
  const { formData, updateFormData, saveProgress, nextStep } =
    useGivveOnboarding();
  const { subsidiary } = useCompany();
  const { toast } = useToast();
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [documentFormData, setDocumentFormData] = useState<DocumentFormData>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data from context more thoroughly
  useEffect(() => {
    console.log("RequiredDocumentsStep - formData changed:", formData);
    if (formData) {
      if (formData.documents) {
        console.log(
          "Setting documentFormData from formData.documents:",
          formData.documents,
        );
        setDocumentFormData(formData.documents);
      } else {
        // If no documents object exists yet, initialize with empty object
        console.log("Initializing empty documentFormData");
        setDocumentFormData({});
      }
    }
  }, [formData]);

  const handleFormDataChange = (data: any) => {
    console.log("handleFormDataChange called with:", data);

    const updatedData = {
      ...documentFormData,
      ...data,
    };

    console.log("Updated documentFormData:", updatedData);
    setDocumentFormData(updatedData);

    // Make sure we update the formData with the document information nested correctly
    updateFormData({ documents: updatedData });
  };

  const handleSubmit = async () => {
    if (!subsidiary?.id || !subsidiary?.legal_form) {
      toast({
        title: "Fehler",
        description: "Fehlende Unternehmens- oder Rechtsforminformationen.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadStatus("uploading");

    try {
      // Prepare files for upload
      const filesToUpload: { [key: string]: CustomFile[] } = {};

      Object.entries(documentFormData).forEach(([key, value]) => {
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          value[0] instanceof File
        ) {
          filesToUpload[key] = value as CustomFile[];
        }
      });

      // Check if this legal form requires file uploads
      const requiresFileUploads = needsFileUploads(subsidiary.legal_form);

      // Only validate file uploads for forms that have upload fields
      if (requiresFileUploads && Object.keys(filesToUpload).length === 0) {
        toast({
          title: "Fehler",
          description: "Bitte laden Sie mindestens ein Dokument hoch.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        setUploadStatus("idle");
        return;
      }

      // If there are files to upload, do so
      let uploadResults = null;
      if (Object.keys(filesToUpload).length > 0) {
        uploadResults = await uploadLegalFormDocuments(
          filesToUpload,
          subsidiary.id,
          subsidiary.legal_form,
        );

        if (!uploadResults && requiresFileUploads) {
          throw new Error("No files were uploaded successfully");
        }
      }

      // Update form data with file metadata if files were uploaded
      const updatedDocuments = { ...documentFormData };
      if (uploadResults) {
        Object.entries(uploadResults).forEach(([key, files]) => {
          updatedDocuments[key] = files;
        });
      }

      const updatedFormData = {
        ...formData,
        documents: updatedDocuments,
      };

      // Save progress with uploaded file information
      await saveProgress({
        ...updatedFormData,
        documentsSubmitted: true,
      });

      setUploadStatus("success");
      toast({
        title: "Erfolg",
        description: requiresFileUploads
          ? "Dokumente wurden erfolgreich hochgeladen."
          : "Daten wurden erfolgreich gespeichert.",
        variant: "default",
      });

      // Move to next step automatically after successful upload
      setTimeout(() => {
        nextStep();
      }, 1500);
    } catch (error) {
      console.error("Error uploading documents:", error);
      setUploadStatus("error");
      toast({
        title: "Fehler",
        description:
          "Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine whether a legal form requires file uploads
  const needsFileUploads = (legalForm: string): boolean => {
    // These legal forms don't require document uploads
    const formsWithoutRequiredUploads = ["Einzelunternehmen", "Freiberufler"];

    return !formsWithoutRequiredUploads.includes(legalForm);
  };

  // Render the appropriate form based on legal form
  const renderLegalFormComponent = () => {
    if (!subsidiary?.legal_form) return null;

    const legalForm = subsidiary.legal_form;
    console.log("Rendering legal form component for:", legalForm);
    console.log("With document form data:", documentFormData);

    const formProps = {
      onChange: handleFormDataChange,
      onFieldsChange: handleFormDataChange,
      formData: documentFormData,
      legalForm: legalForm,
    };

    switch (legalForm) {
      case "Freiberufler":
        return <FreiberuflerForm {...formProps} />;
      case "Einzelunternehmen":
        return <EinzelunternehmenForm {...formProps} />;
      case "GbR":
        return <GbrForm {...formProps} />;
      case "e.K.":
        return <EkForm {...formProps} />;
      case "e.V. / e.G.":
        return <VereinGenossForm {...formProps} />;
      case "PartG":
        return <PartGForm {...formProps} />;
      case "GmbH / UG":
        return <GmbHUGForm {...formProps} />;
      case "GmbH & Co. KG":
        return <GmbHCoKGForm {...formProps} />;
      case "KdöR":
        return <KdoerForm {...formProps} />;
      case "KG / OHG":
        return <KgOhgForm {...formProps} />;
      default:
        return <OtherForm {...formProps} />;
    }
  };

  return (
    <StepLayout
      title="Rechtliche Dokumente"
      description="Bitte laden Sie die erforderlichen Dokumente für Ihre Rechtsform hoch."
      onSave={handleSubmit}
      disableNext={isSubmitting || uploadStatus === "uploading"}
      isProcessing={uploadStatus === "uploading"}
      status={formData.status}
    >
      <div className="space-y-8">
        {/* GwG Information Card - Always shown at the top */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Shield className="mr-2 h-5 w-5 text-primary" />
              Information zum Geldwäschegesetz (GwG)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed text-foreground">
              <p className="mb-4">
                Entsprechend den Sorgfaltspflichten nach dem Geldwäschegesetz
                (GwG) benötigen wir Unterlagen zur Identifizierung der
                wirtschaftlich Berechtigten. Diese Informationen sind gesetzlich
                vorgeschrieben und dienen der Prävention von Geldwäsche und
                Terrorismusfinanzierung.
              </p>
              <div className="mt-4 rounded-lg border bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">
                      Wichtiger Hinweis
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Wir sind gesetzlich verpflichtet, die Identität und
                      wirtschaftliche Berechtigung im Rahmen der givve® Card
                      Bestellung zu prüfen. Diese Maßnahmen dienen Ihrer
                      Sicherheit und dem Schutz vor Missbrauch.
                    </p>
                  </div>
                </div>
              </div>
            </CardDescription>
          </CardContent>
        </Card>

        {/* Legal Form Specific Documents Section */}
        {renderLegalFormComponent()}
      </div>
    </StepLayout>
  );
};
