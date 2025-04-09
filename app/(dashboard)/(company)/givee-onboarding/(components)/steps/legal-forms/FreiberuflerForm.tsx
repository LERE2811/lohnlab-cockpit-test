"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Info } from "lucide-react";
import { IndustrySelect, PepCheckComponent } from "./components";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";

interface FreiberuflerFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm?: string;
}

export const FreiberuflerForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: FreiberuflerFormProps) => {
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

  if (!subsidiary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          Freiberufler - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für Freiberufler benötigen wir einen
                Nachweis über die freiberufliche Tätigkeit sowie einen
                Personalausweis.
              </p>
            </div>
          </div>
        </div>

        {/* Industry Category Selection */}
        <IndustrySelect
          value={industry}
          onChange={handleIndustryChange}
          className="mb-6"
        />

        <div className="space-y-6">
          {/* Nachweis der freiberuflichen Tätigkeit */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              1. Nachweis der freiberuflichen Tätigkeit
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie einen Nachweis über Ihre freiberufliche Tätigkeit
              hoch (z.B. Zulassung, Approbation, Berufsausweis).
            </p>
            <FileUpload
              folder={`${subsidiary.id}/legal_form_documents/freiberufler_nachweis`}
              subsidiaryId={subsidiary.id}
              onUploadComplete={(fileData) =>
                handleFileUpload("freiberuflerNachweis", fileData)
              }
              onRemove={() => handleFileRemove("freiberuflerNachweis")}
              existingFileUrl={
                getDocument("freiberuflerNachweis")?.signedUrl || null
              }
              existingFilePath={
                getDocument("freiberuflerNachweis")?.filePath || null
              }
              existingFileName={
                getDocument("freiberuflerNachweis")?.fileName || null
              }
              acceptedFileTypes="application/pdf,image/*"
              maxSizeMB={10}
              label="Nachweis hochladen"
              bucket="givve_documents"
            />
          </div>

          {/* Personalausweis */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">2. Personalausweis</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie eine Kopie Ihres Personalausweises hoch.
            </p>
            <FileUpload
              folder={`${subsidiary.id}/identification_documents/personalausweise`}
              subsidiaryId={subsidiary.id}
              onUploadComplete={(fileData) =>
                handleFileUpload("personalausweis", fileData)
              }
              onRemove={() => handleFileRemove("personalausweis")}
              existingFileUrl={
                getDocument("personalausweis")?.signedUrl || null
              }
              existingFilePath={
                getDocument("personalausweis")?.filePath || null
              }
              existingFileName={
                getDocument("personalausweis")?.fileName || null
              }
              acceptedFileTypes="application/pdf,image/*"
              maxSizeMB={10}
              label="Personalausweis hochladen"
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
