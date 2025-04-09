"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Info } from "lucide-react";
import { PepCheckComponent, IndustrySelect } from "./components";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";

interface FileData {
  signedUrl: string;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface KdoerFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm?: string;
}

export const KdoerForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: KdoerFormProps) => {
  const { subsidiary } = useCompany();
  const [documentState, setDocumentState] = useState({
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  });
  const [industry, setIndustry] = useState<string>(formData.industry || "");

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

  const handleFileUpload = (fileData: FileData, type: string) => {
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

  // Update parent form data when PEP information changes
  const handleDocumentStateChange = (newState: any) => {
    setDocumentState(newState);
    onFieldsChange({
      ...formData,
      hasPep: newState.hasPep,
      pepDetails: newState.pepDetails,
    });
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    onFieldsChange({
      ...formData,
      industry: value,
    });
  };

  if (!subsidiary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          Körperschaft des öffentlichen Rechts - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für Körperschaften des öffentlichen
                Rechts benötigen wir die Satzung bzw. den Errichtungsakt als
                Nachweis.
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
          {/* Satzung */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">1. Satzung</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie die aktuelle Satzung oder den Errichtungsakt hoch.
            </p>

            <FileUpload
              folder={`${subsidiary.id}/legal_form_documents/satzung`}
              subsidiaryId={subsidiary.id}
              bucket="givve_documents"
              acceptedFileTypes="application/pdf,image/*"
              maxSizeMB={10}
              label="Satzung hochladen"
              onUploadComplete={(fileData) =>
                handleFileUpload(fileData, "satzung")
              }
              onRemove={() => handleFileRemove("satzung")}
              existingFileUrl={getDocument("satzung")?.signedUrl || null}
              existingFilePath={getDocument("satzung")?.filePath || null}
              existingFileName={getDocument("satzung")?.fileName || null}
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
