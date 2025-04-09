"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Info } from "lucide-react";
import { PepCheckComponent, IndustrySelect } from "./components";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";

interface JuristischePersonFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm?: string;
}

export const JuristischePersonForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: JuristischePersonFormProps) => {
  const { subsidiary } = useCompany();
  const [isRegistered, setIsRegistered] = useState<boolean | null>(
    formData.isRegistered !== undefined ? formData.isRegistered : null,
  );
  const industry = formData.industry || "";
  const documentState = {
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
    hasLegalEntityRepresentative:
      formData.hasLegalEntityRepresentative || false,
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

  const handleRegistrationChange = (value: string) => {
    const isReg = value === "registered";
    setIsRegistered(isReg);
    onFieldsChange({
      ...formData,
      isRegistered: isReg,
    });
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

  const handleRepresentativeChange = (hasRep: boolean) => {
    onFieldsChange({
      ...formData,
      hasLegalEntityRepresentative: hasRep,
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
          Juristische Person - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Gemäß den Bestimmungen des
                Geldwäschegesetzes (GwG) sind wir verpflichtet, die Identität
                des Vertragspartners festzustellen. Hierzu benötigen wir
                entsprechende Nachweise.
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
          <RadioGroup
            value={
              isRegistered === true
                ? "registered"
                : isRegistered === false
                  ? "not_registered"
                  : ""
            }
            onValueChange={handleRegistrationChange}
          >
            <div className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100">
              <RadioGroupItem value="registered" id="registered" />
              <Label htmlFor="registered" className="text-sm">
                Eintragung im öffentlichen Verzeichnis (z.B. Handelsregister)
                liegt vor.
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100">
              <RadioGroupItem value="not_registered" id="not_registered" />
              <Label htmlFor="not_registered" className="text-sm">
                Der Vertragspartner hat keine Eintragungspflicht in ein
                öffentliches Verzeichnis.
              </Label>
            </div>
          </RadioGroup>

          {isRegistered === true && (
            <div className="mt-4">
              <h4 className="text-md mb-3 font-medium">1. Registerauszug</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Bitte laden Sie einen aktuellen Registerauszug hoch (nicht älter
                als 6 Monate).
              </p>
              <FileUpload
                folder={`${subsidiary.id}/legal_form_documents/register_extract`}
                subsidiaryId={subsidiary.id}
                onUploadComplete={(fileData) =>
                  handleFileUpload("registerExtract", fileData)
                }
                onRemove={() => handleFileRemove("registerExtract")}
                existingFileUrl={
                  getDocument("registerExtract")?.signedUrl || null
                }
                existingFilePath={
                  getDocument("registerExtract")?.filePath || null
                }
                existingFileName={
                  getDocument("registerExtract")?.fileName || null
                }
                acceptedFileTypes="application/pdf,image/*"
                maxSizeMB={10}
                label="Registerauszug hochladen"
                bucket="givve_documents"
              />
            </div>
          )}

          {isRegistered === false && (
            <div className="mt-4">
              <h4 className="text-md mb-3 font-medium">
                1. Alternativer Nachweis
              </h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Bitte laden Sie einen alternativen Nachweis über die Existenz
                und rechtliche Struktur hoch (z.B. Satzung,
                Gesellschaftsvertrag).
              </p>
              <FileUpload
                folder={`${subsidiary.id}/legal_form_documents/alternative_document`}
                subsidiaryId={subsidiary.id}
                onUploadComplete={(fileData) =>
                  handleFileUpload("alternativeDocument", fileData)
                }
                onRemove={() => handleFileRemove("alternativeDocument")}
                existingFileUrl={
                  getDocument("alternativeDocument")?.signedUrl || null
                }
                existingFilePath={
                  getDocument("alternativeDocument")?.filePath || null
                }
                existingFileName={
                  getDocument("alternativeDocument")?.fileName || null
                }
                acceptedFileTypes="application/pdf,image/*"
                maxSizeMB={10}
                label="Alternativen Nachweis hochladen"
                bucket="givve_documents"
              />
            </div>
          )}

          {/* Transparenzregister */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              2. Transparenzregisterauszug
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
