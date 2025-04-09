"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2, Info } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  TransparenzregisterInfoDialog,
  PepCheckComponent,
  IndustrySelect,
} from "./components";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";

interface KgOhgFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm: string;
}

export const KgOhgForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: KgOhgFormProps) => {
  const { subsidiary } = useCompany();
  const industry = formData.industry || "";
  const hasLegalEntityRepresentative =
    formData.hasLegalEntityRepresentative || null;
  const documentState = {
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  };

  const formType = legalForm || "Personengesellschaft";

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

  const handleLegalEntityRepresentativeChange = (value: boolean) => {
    onFieldsChange({
      ...formData,
      hasLegalEntityRepresentative: value,
    });
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
          {formType} - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für Personengesellschaften benötigen
                wir einen aktuellen Handelsregisterauszug. Falls ein Vertreter
                eine juristische Person ist, wird zusätzlich der
                Handelsregisterauszug dieser juristischen Person benötigt.
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
          {/* Handelsregisterauszug */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              1. Handelsregisterauszug
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie einen aktuellen Handelsregisterauszug hoch (nicht
              älter als 6 Monate).
            </p>
            <FileUpload
              folder={`${subsidiary.id}/legal_form_documents/handelsregister`}
              subsidiaryId={subsidiary.id}
              onUploadComplete={(fileData) =>
                handleFileUpload("handelsregister", fileData)
              }
              onRemove={() => handleFileRemove("handelsregister")}
              existingFileUrl={
                getDocument("handelsregister")?.signedUrl || null
              }
              existingFilePath={
                getDocument("handelsregister")?.filePath || null
              }
              existingFileName={
                getDocument("handelsregister")?.fileName || null
              }
              acceptedFileTypes="application/pdf,image/*"
              maxSizeMB={10}
              label="Handelsregisterauszug hochladen"
              bucket="givve_documents"
            />
          </div>

          {/* Juristische Person als Vertreter */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              2. Juristische Person als Vertreter
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Gibt es eine juristische Person als Vertreter?
            </p>

            <RadioGroup
              value={
                hasLegalEntityRepresentative
                  ? "yes"
                  : hasLegalEntityRepresentative === false
                    ? "no"
                    : ""
              }
              onValueChange={(value) =>
                handleLegalEntityRepresentativeChange(value === "yes")
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="legal-entity-yes" />
                <Label htmlFor="legal-entity-yes">
                  Ja, es gibt eine juristische Person als Vertreter
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="legal-entity-no" />
                <Label htmlFor="legal-entity-no">
                  Nein, keine juristische Person als Vertreter
                </Label>
              </div>
            </RadioGroup>

            {hasLegalEntityRepresentative && (
              <div className="mt-4">
                <h4 className="text-md mb-3 font-medium">
                  3. Handelsregisterauszug der juristischen Person
                </h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Bitte laden Sie den Handelsregisterauszug der juristischen
                  Person hoch.
                </p>
                <FileUpload
                  folder={`${subsidiary.id}/legal_form_documents/representative_handelsregister`}
                  subsidiaryId={subsidiary.id}
                  onUploadComplete={(fileData) =>
                    handleFileUpload("representativeHandelsregister", fileData)
                  }
                  onRemove={() =>
                    handleFileRemove("representativeHandelsregister")
                  }
                  existingFileUrl={
                    getDocument("representativeHandelsregister")?.signedUrl ||
                    null
                  }
                  existingFilePath={
                    getDocument("representativeHandelsregister")?.filePath ||
                    null
                  }
                  existingFileName={
                    getDocument("representativeHandelsregister")?.fileName ||
                    null
                  }
                  acceptedFileTypes="application/pdf,image/*"
                  maxSizeMB={10}
                  label="Handelsregisterauszug hochladen"
                  bucket="givve_documents"
                />
              </div>
            )}
          </div>

          {/* Transparenzregister */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              {hasLegalEntityRepresentative ? "4" : "3"}.
              Transparenzregisterauszug
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
