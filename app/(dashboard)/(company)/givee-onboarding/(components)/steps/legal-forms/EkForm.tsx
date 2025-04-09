"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, Info } from "lucide-react";
import { PepCheckComponent, IndustrySelect } from "./components";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";

interface EkFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm?: string;
}

export const EkForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: EkFormProps) => {
  const { subsidiary } = useCompany();
  const [industry, setIndustry] = useState<string>(formData.industry || "");
  const [documentState, setDocumentState] = useState({
    handelsregisterNumber: formData.handelsregisterNumber || "",
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

  const handleInputChange = (field: string, value: string) => {
    const updatedState = {
      ...documentState,
      [field]: value,
    };

    setDocumentState(updatedState);
    onFieldsChange({
      ...formData,
      ...updatedState,
    });
  };

  // Update parent form data when PEP information changes
  const handleDocumentStateChange = (newState: any) => {
    setDocumentState({
      ...documentState,
      hasPep: newState.hasPep,
      pepDetails: newState.pepDetails,
    });
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
          Eingetragener Kaufmann (e.K.) - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für einen eingetragenen Kaufmann
                benötigen wir den Handelsregisterauszug sowie persönliche
                Informationen zur Identifikation.
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
          <div>
            <h4 className="text-md mb-3 font-medium">Handelsregisterauszug</h4>
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

          <div className="mt-4 space-y-2">
            <Label htmlFor="handelsregisterNummer-ek">
              Handelsregisternummer
            </Label>
            <Input
              id="handelsregisterNummer-ek"
              value={documentState.handelsregisterNumber}
              onChange={(e) =>
                handleInputChange("handelsregisterNumber", e.target.value)
              }
              placeholder="z.B. HRA 12345"
            />
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="text-md mb-3 font-medium">Persönliche Daten</h4>

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">Persönliche Daten eingeben</h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName-ek-reg">Vorname</Label>
                  <Input
                    id="firstName-ek-reg"
                    value={documentState.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName-ek-reg">Nachname</Label>
                  <Input
                    id="lastName-ek-reg"
                    value={documentState.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate-ek-reg">Geburtsdatum</Label>
                  <Input
                    id="birthDate-ek-reg"
                    placeholder="TT.MM.JJJJ"
                    value={documentState.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthPlace-ek-reg">Geburtsort</Label>
                  <Input
                    id="birthPlace-ek-reg"
                    value={documentState.birthPlace}
                    onChange={(e) =>
                      handleInputChange("birthPlace", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality-ek-reg">
                    Staatsangehörigkeit
                  </Label>
                  <Input
                    id="nationality-ek-reg"
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
                  <Label htmlFor="street-ek-reg">Straße</Label>
                  <Input
                    id="street-ek-reg"
                    value={documentState.street}
                    onChange={(e) =>
                      handleInputChange("street", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="houseNumber-ek-reg">Hausnummer</Label>
                  <Input
                    id="houseNumber-ek-reg"
                    value={documentState.houseNumber}
                    onChange={(e) =>
                      handleInputChange("houseNumber", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode-ek-reg">PLZ</Label>
                  <Input
                    id="postalCode-ek-reg"
                    value={documentState.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city-ek-reg">Ort</Label>
                  <Input
                    id="city-ek-reg"
                    value={documentState.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PEP Check */}
          <PepCheckComponent
            documentState={{
              hasPep: documentState.hasPep,
              pepDetails: documentState.pepDetails,
            }}
            setDocumentState={handleDocumentStateChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};
