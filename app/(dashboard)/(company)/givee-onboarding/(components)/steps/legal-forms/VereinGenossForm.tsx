"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2, Info } from "lucide-react";
import { PepCheckComponent, IndustrySelect } from "./components";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";

interface VereinGenossFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm: string;
}

export const VereinGenossForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: VereinGenossFormProps) => {
  const { subsidiary } = useCompany();
  const [isRegistered, setIsRegistered] = useState<boolean | null>(
    formData.isRegistered || null,
  );
  const industry = formData.industry || "";
  const documentState = {
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  };

  // Determine if it's a Verein or Genossenschaft
  const isVerein = legalForm.includes("V.");
  const formTitle = isVerein
    ? "Eingetragener Verein"
    : "Eingetragene Genossenschaft";
  const registerType = isVerein ? "Vereinsregister" : "Genossenschaftsregister";

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
        registerType:
          type === "register" && isRegistered
            ? isVerein
              ? "vereinsregister"
              : "genossenschaftsregister"
            : formData.registerType,
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
        registerType:
          type === "register" && isRegistered
            ? isVerein
              ? "vereinsregister"
              : "genossenschaftsregister"
            : formData.registerType,
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

  const handleRegisteredChange = (value: boolean) => {
    setIsRegistered(value);
    onFieldsChange({
      ...formData,
      isRegistered: value,
      registerType:
        value && (isVerein ? "vereinsregister" : "genossenschaftsregister"),
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
          {formTitle} - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für{" "}
                {isVerein
                  ? "eingetragene Vereine"
                  : "eingetragene Genossenschaften"}{" "}
                benötigen wir einen Nachweis der Eintragung oder alternativ die
                Satzung zusammen mit dem Protokoll der letzten
                Mitgliederversammlung.
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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Ist {isVerein ? "der Verein" : "die Genossenschaft"} im{" "}
              {registerType} eingetragen?
            </Label>
            <div className="flex space-x-4">
              <Button
                variant={isRegistered === true ? "default" : "outline"}
                onClick={() => handleRegisteredChange(true)}
              >
                Ja
              </Button>
              <Button
                variant={isRegistered === false ? "default" : "outline"}
                onClick={() => handleRegisteredChange(false)}
              >
                Nein
              </Button>
            </div>
          </div>

          {isRegistered === true && (
            <div className="mt-4">
              <h4 className="text-md mb-3 font-medium">
                1. {registerType}auszug
              </h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Bitte laden Sie einen aktuellen {registerType}auszug hoch (nicht
                älter als 6 Monate).
              </p>
              <FileUpload
                folder={`${subsidiary.id}/legal_form_documents/${isVerein ? "vereinsregister" : "genossenschaftsregister"}`}
                subsidiaryId={subsidiary.id}
                onUploadComplete={(fileData) =>
                  handleFileUpload("register", fileData)
                }
                onRemove={() => handleFileRemove("register")}
                existingFileUrl={getDocument("register")?.signedUrl || null}
                existingFilePath={getDocument("register")?.filePath || null}
                existingFileName={getDocument("register")?.fileName || null}
                acceptedFileTypes="application/pdf,image/*"
                maxSizeMB={10}
                label={`${registerType}auszug hochladen`}
                bucket="givve_documents"
              />
            </div>
          )}

          {isRegistered === false && (
            <>
              <div className="mt-4">
                <h4 className="text-md mb-3 font-medium">1. Satzung</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Bitte laden Sie die aktuelle Satzung hoch.
                </p>
                <FileUpload
                  folder={`${subsidiary.id}/legal_form_documents/satzung`}
                  subsidiaryId={subsidiary.id}
                  onUploadComplete={(fileData) =>
                    handleFileUpload("satzung", fileData)
                  }
                  onRemove={() => handleFileRemove("satzung")}
                  existingFileUrl={getDocument("satzung")?.signedUrl || null}
                  existingFilePath={getDocument("satzung")?.filePath || null}
                  existingFileName={getDocument("satzung")?.fileName || null}
                  acceptedFileTypes="application/pdf,image/*"
                  maxSizeMB={10}
                  label="Satzung hochladen"
                  bucket="givve_documents"
                />
              </div>

              <div className="mt-4">
                <h4 className="text-md mb-3 font-medium">
                  2. Protokoll der letzten Mitgliederversammlung
                </h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Bitte laden Sie das Protokoll der letzten
                  Mitgliederversammlung hoch.
                </p>
                <FileUpload
                  folder={`${subsidiary.id}/legal_form_documents/protokoll`}
                  subsidiaryId={subsidiary.id}
                  onUploadComplete={(fileData) =>
                    handleFileUpload("protokoll", fileData)
                  }
                  onRemove={() => handleFileRemove("protokoll")}
                  existingFileUrl={getDocument("protokoll")?.signedUrl || null}
                  existingFilePath={getDocument("protokoll")?.filePath || null}
                  existingFileName={getDocument("protokoll")?.fileName || null}
                  acceptedFileTypes="application/pdf,image/*"
                  maxSizeMB={10}
                  label="Protokoll hochladen"
                  bucket="givve_documents"
                />
              </div>
            </>
          )}

          {/* Transparenzregister */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              {isRegistered ? "2" : "3"}. Transparenzregisterauszug
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
