"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IndustrySelect,
  PepCheckComponent,
  MultipleFileUpload,
} from "./components";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";
import { OnboardingFileMetadata } from "../../types";

interface OtherFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm: string;
}

export const OtherForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: OtherFormProps) => {
  const { subsidiary } = useCompany();
  const industry = formData.industry || "";
  const documentState = {
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  };

  // Helper function to access documents regardless of nesting
  const getDocument = (key: string) => {
    // Try direct access first (documents might be flattened)
    if (
      formData[key] &&
      typeof formData[key] === "object" &&
      "fileName" in formData[key]
    ) {
      return formData[key];
    }

    // Then try through documents object
    if (formData.documents && formData.documents[key]) {
      return formData.documents[key];
    }

    // Finally, try through nested documents object
    if (
      formData.documents &&
      formData.documents.documents &&
      formData.documents.documents[key]
    ) {
      return formData.documents.documents[key];
    }

    return null;
  };

  const handleFileUpload = (
    type: string,
    fileData: {
      signedUrl: string;
      filePath: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    },
  ) => {
    // Create a new file metadata object
    const newFileMetadata = {
      fileName: fileData.fileName,
      filePath: fileData.filePath,
      fileType: fileData.fileType,
      fileSize: fileData.fileSize,
      signedUrl: fileData.signedUrl,
      uploadedAt: new Date().toISOString(),
    };

    // Check if we need to use the current structure or create a new one
    if (!formData.documents) {
      // No documents object yet, create one
      onFieldsChange({
        ...formData,
        documents: {
          [type]: newFileMetadata,
        },
      });
    } else {
      // We have a documents object already
      onFieldsChange({
        ...formData,
        // Add directly to top level as well as under documents to ensure it's found
        [type]: newFileMetadata,
        documents: {
          ...formData.documents,
          [type]: newFileMetadata,
        },
      });
    }
  };

  const handleFileRemove = (type: string) => {
    // Create a copy of formData to modify
    const updatedFormData = { ...formData };

    // Remove from all possible locations
    if (updatedFormData[type]) {
      delete updatedFormData[type];
    }

    if (updatedFormData.documents) {
      if (updatedFormData.documents[type]) {
        const updatedDocuments = { ...updatedFormData.documents };
        delete updatedDocuments[type];
        updatedFormData.documents = updatedDocuments;
      }

      // Also check nested documents
      if (
        updatedFormData.documents.documents &&
        updatedFormData.documents.documents[type]
      ) {
        const updatedNestedDocuments = {
          ...updatedFormData.documents.documents,
        };
        delete updatedNestedDocuments[type];
        updatedFormData.documents.documents = updatedNestedDocuments;
      }
    }

    onFieldsChange(updatedFormData);
  };

  const handleIndustryChange = (value: string) => {
    onFieldsChange({
      ...formData,
      industry: value,
    });
  };

  // Update parent form data when PEP information changes
  const handleDocumentStateChange = (newState: any) => {
    onFieldsChange({
      ...formData,
      hasPep: newState.hasPep,
      pepDetails: newState.pepDetails,
    });
  };

  // Function to get title based on legal form
  const getFormTitle = () => {
    if (legalForm.includes("KG") || legalForm.includes("OHG")) {
      return "Benötigte Unterlagen für Personengesellschaft";
    } else if (
      legalForm.includes("Einzelkaufmann") ||
      legalForm.includes("EK")
    ) {
      return "Benötigte Unterlagen für Einzelkaufmann";
    } else {
      return `Benötigte Unterlagen für ${legalForm || "Ihre Rechtsform"}`;
    }
  };

  if (!subsidiary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          {getFormTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für Ihre Rechtsform (
                {legalForm || "andere"}) benötigen wir Nachweise über die
                rechtliche Existenz und Identifikationsdokumente der
                vertretungsberechtigten Personen und wirtschaftlich
                Berechtigten.
              </p>
            </div>
          </div>
        </div>

        <Alert
          variant="default"
          className="mb-4 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
        >
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Für diese Rechtsform werden die grundlegenden Dokumente erfasst.
            Falls weitere spezifische Unterlagen benötigt werden, kontaktieren
            wir Sie nach Einreichung.
          </AlertDescription>
        </Alert>

        {/* Industry Category Selection */}
        <IndustrySelect
          value={industry}
          onChange={handleIndustryChange}
          className="mb-6"
        />

        <div className="space-y-6">
          {/* Existence Proof */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              1. Nachweis der rechtlichen Existenz
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Nachweis über die Existenz und rechtliche Struktur (z.B.
              Handelsregisterauszug, Gewerbeanmeldung, Satzung).
            </p>
            <FileUpload
              folder={`${subsidiary.id}/legal_form_documents/existence_proof`}
              subsidiaryId={subsidiary.id}
              onUploadComplete={(fileData) =>
                handleFileUpload("existenceProof", fileData)
              }
              onRemove={() => handleFileRemove("existenceProof")}
              existingFileUrl={getDocument("existenceProof")?.signedUrl || null}
              existingFilePath={getDocument("existenceProof")?.filePath || null}
              existingFileName={getDocument("existenceProof")?.fileName || null}
              acceptedFileTypes="application/pdf,image/*"
              maxSizeMB={10}
              label="Nachweis der rechtlichen Existenz hochladen"
              bucket="givve_documents"
            />
          </div>

          {/* Personalausweise */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              2. Personalausweise der vertretungsberechtigten Personen
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie die Personalausweise aller vertretungsberechtigten
              Personen in einer PDF-Datei hoch.
            </p>
            <FileUpload
              folder={`${subsidiary.id}/identification_documents/personalausweise`}
              subsidiaryId={subsidiary.id}
              onUploadComplete={(fileData) =>
                handleFileUpload("personalausweise", fileData)
              }
              onRemove={() => handleFileRemove("personalausweise")}
              existingFileUrl={
                getDocument("personalausweise")?.signedUrl || null
              }
              existingFilePath={
                getDocument("personalausweise")?.filePath || null
              }
              existingFileName={
                getDocument("personalausweise")?.fileName || null
              }
              acceptedFileTypes="application/pdf,image/*"
              maxSizeMB={10}
              label="Personalausweise hochladen"
              bucket="givve_documents"
            />
          </div>

          {/* Transparenzregister */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              3. Transparenzregisterauszug
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie einen aktuellen Transparenzregisterauszug zur
              Identifizierung der wirtschaftlich Berechtigten hoch.
            </p>
            <FileUpload
              folder={`${subsidiary.id}/legal_form_documents/transparenzregister`}
              subsidiaryId={subsidiary.id}
              onUploadComplete={(fileData) =>
                handleFileUpload("transparenzregister", fileData)
              }
              onRemove={() => handleFileRemove("transparenzregister")}
              existingFileUrl={
                getDocument("transparenzregister")?.signedUrl || null
              }
              existingFilePath={
                getDocument("transparenzregister")?.filePath || null
              }
              existingFileName={
                getDocument("transparenzregister")?.fileName || null
              }
              acceptedFileTypes="application/pdf,image/*"
              maxSizeMB={10}
              label="Transparenzregisterauszug hochladen"
              bucket="givve_documents"
            />
          </div>

          {/* Additional Documents */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              4. Weitere Unterlagen (optional)
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Falls Sie weitere relevante Unterlagen haben, können Sie diese
              hier hochladen.
            </p>
            <MultipleFileUpload
              folder={`${subsidiary.id}/legal_form_documents/additional_documents`}
              subsidiaryId={subsidiary.id}
              onUploadComplete={(fileData) => {
                const additionalDocs = formData.additionalDocs || [];
                onFieldsChange({
                  ...formData,
                  additionalDocs: [...additionalDocs, fileData],
                });
              }}
              onRemove={(filePath) => {
                const updatedDocs = (formData.additionalDocs || []).filter(
                  (doc: OnboardingFileMetadata) => doc.filePath !== filePath,
                );
                onFieldsChange({
                  ...formData,
                  additionalDocs: updatedDocs,
                });
              }}
              existingFiles={formData.additionalDocs || []}
              acceptedFileTypes="application/pdf,image/*"
              maxSizeMB={10}
              label="Weitere Unterlagen hochladen"
              bucket="givve_documents"
            />
          </div>

          {/* PEP Check */}
          <PepCheckComponent
            documentState={documentState}
            setDocumentState={handleDocumentStateChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};
