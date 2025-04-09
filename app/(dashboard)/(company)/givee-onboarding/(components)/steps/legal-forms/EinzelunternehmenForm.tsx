"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, Upload, Info, FileText, Trash2 } from "lucide-react";
import { PepCheckComponent, IndustrySelect } from "./components";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";

interface EinzelunternehmenFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm?: string;
}

export const EinzelunternehmenForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: EinzelunternehmenFormProps) => {
  console.log("EinzelunternehmenForm rendering with formData:", formData);
  const { subsidiary } = useCompany();

  const [gewerbeanmeldungFile, setGewerbeanmeldungFile] = useState<File | null>(
    null,
  );
  const [industry, setIndustry] = useState<string>(formData.industry || "");
  const [documentState, setDocumentState] = useState({
    firstName: formData.firstName || "",
    lastName: formData.lastName || "",
    birthDate: formData.birthDate || "",
    birthPlace: formData.birthPlace || "",
    nationality: formData.nationality || "",
    street: formData.street || "",
    houseNumber: formData.houseNumber || "",
    postalCode: formData.postalCode || "",
    city: formData.city || "",
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  });

  // Add an effect to update state when formData changes
  useEffect(() => {
    console.log("EinzelunternehmenForm formData changed:", formData);
    setIndustry(formData.industry || "");
    setDocumentState({
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      birthDate: formData.birthDate || "",
      birthPlace: formData.birthPlace || "",
      nationality: formData.nationality || "",
      street: formData.street || "",
      houseNumber: formData.houseNumber || "",
      postalCode: formData.postalCode || "",
      city: formData.city || "",
      hasPep: formData.hasPep || false,
      pepDetails: formData.pepDetails || "",
    });
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    const updatedState = {
      ...documentState,
      [field]: value,
    };

    setDocumentState(updatedState);

    onFieldsChange({
      ...formData,
      [field]: value,
    });
  };

  const handleDocumentStateChange = (newState: any) => {
    console.log("handleDocumentStateChange called with:", newState);

    // Ensure we're handling hasPep properly as a boolean
    const updatedState = {
      ...documentState,
      hasPep: Boolean(newState.hasPep), // Force conversion to boolean
      pepDetails: newState.pepDetails || "",
    };

    setDocumentState(updatedState);

    onFieldsChange({
      ...formData,
      hasPep: Boolean(newState.hasPep), // Force conversion to boolean when passing to parent
      pepDetails: newState.pepDetails || "",
    });
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);

    onFieldsChange({
      ...formData,
      industry: value,
    });
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

  if (!subsidiary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          Einzelunternehmen - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Zur Identifizierung des
                Vertragspartners benötigen wir gemäß §§ 11 Abs. 4 Nr. 1, 12, 13
                GwG; Auslegungs- und Anwendungshinweise Ziffer 5.1.3 die unten
                aufgeführten Informationen.
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
          <div className="mt-6 space-y-4">
            <h4 className="text-md mb-3 font-medium">Persönliche Daten</h4>

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">Persönliche Daten eingeben</h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName-ek">Vorname</Label>
                  <Input
                    id="firstName-ek"
                    value={documentState.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName-ek">Nachname</Label>
                  <Input
                    id="lastName-ek"
                    value={documentState.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate-ek">Geburtsdatum</Label>
                  <Input
                    id="birthDate-ek"
                    placeholder="TT.MM.JJJJ"
                    value={documentState.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthPlace-ek">Geburtsort</Label>
                  <Input
                    id="birthPlace-ek"
                    value={documentState.birthPlace}
                    onChange={(e) =>
                      handleInputChange("birthPlace", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality-ek">Staatsangehörigkeit</Label>
                  <Input
                    id="nationality-ek"
                    value={documentState.nationality}
                    onChange={(e) =>
                      handleInputChange("nationality", e.target.value)
                    }
                  />
                </div>
              </div>

              <h4 className="mt-4 font-medium">Wohnanschrift</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="street-ek">Straße</Label>
                  <Input
                    id="street-ek"
                    value={documentState.street}
                    onChange={(e) =>
                      handleInputChange("street", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="houseNumber-ek">Hausnummer</Label>
                  <Input
                    id="houseNumber-ek"
                    value={documentState.houseNumber}
                    onChange={(e) =>
                      handleInputChange("houseNumber", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode-ek">PLZ</Label>
                  <Input
                    id="postalCode-ek"
                    value={documentState.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city-ek">Ort</Label>
                  <Input
                    id="city-ek"
                    value={documentState.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PEP Check Component */}
          <PepCheckComponent
            documentState={documentState}
            setDocumentState={handleDocumentStateChange}
            className="mt-6"
          />

          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              Gewerbeanmeldung / Gewerbeschein
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie Ihre Gewerbeanmeldung oder Ihren Gewerbeschein
              hoch.
            </p>
            <FileUpload
              folder={`${subsidiary.id}/legal_form_documents/gewerbeanmeldung`}
              subsidiaryId={subsidiary.id}
              onUploadComplete={(fileData) =>
                handleFileUpload("gewerbeanmeldung", fileData)
              }
              onRemove={() => handleFileRemove("gewerbeanmeldung")}
              existingFileUrl={
                getDocument("gewerbeanmeldung")?.signedUrl || null
              }
              existingFilePath={
                getDocument("gewerbeanmeldung")?.filePath || null
              }
              existingFileName={
                getDocument("gewerbeanmeldung")?.fileName || null
              }
              acceptedFileTypes="application/pdf,image/*"
              maxSizeMB={10}
              label="Gewerbeanmeldung hochladen"
              bucket="givve_documents"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
