"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Info } from "lucide-react";
import { PepCheckComponent, IndustrySelect } from "./components";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface GmbHUGFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm: string;
}

export const GmbHUGForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: GmbHUGFormProps) => {
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

  const formType = legalForm || "GmbH";

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

  // Handle changes for text fields
  const handleFieldChange = (field: string, value: string) => {
    // Create a copy of the existing documents or initialize it
    const updatedDocuments = {
      ...(formData.documents || {}),
      [field]: value,
    };

    onFieldsChange({
      ...formData,
      documents: updatedDocuments,
      // Also add at root level for compatibility
      [field]: value,
    });
  };

  // Handle changes for legal representatives
  const handleRepresentativeChange = (index: number, value: string) => {
    const representatives = [
      ...(formData.representatives || [
        ...(formData.documents?.representatives || []),
      ]),
    ];
    representatives[index] = value;

    // Create a copy of the existing documents or initialize it
    const updatedDocuments = {
      ...(formData.documents || {}),
      representatives,
    };

    // Debug log
    console.log("Setting representatives:", representatives);

    onFieldsChange({
      ...formData,
      documents: updatedDocuments,
      // Also add at root level for compatibility
      representatives,
    });
  };

  // Handle changes for beneficial owners
  const handleBeneficialOwnerChange = (
    rowIndex: number,
    field: string,
    value: string,
  ) => {
    // Get the current beneficial owners or initialize
    const beneficialOwners = [...(formData.beneficialOwners || [])];

    // Initialize the row if it doesn't exist
    if (!beneficialOwners[rowIndex]) {
      beneficialOwners[rowIndex] = {};
    }

    // Update the specific field
    beneficialOwners[rowIndex][field] = value;

    // Create field names for the PDF form
    const fieldName = `${field}Row${rowIndex + 1}`;

    // Create a copy of the existing documents or initialize it
    const updatedDocuments = {
      ...(formData.documents || {}),
      beneficialOwners,
      [fieldName]: value, // Add individual field for direct mapping
    };

    // Debug log
    console.log(`Setting beneficial owner field ${fieldName} to:`, value);

    onFieldsChange({
      ...formData,
      documents: updatedDocuments,
      // Also add at root level for compatibility
      beneficialOwners,
      [fieldName]: value,
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
                <strong>Hinweis:</strong> Für {formType} benötigen wir einen
                aktuellen Handelsregisterauszug und einen
                Transparenzregisterauszug, um die wirtschaftlich Berechtigten zu
                identifizieren.
              </p>
            </div>
          </div>
        </div>

        {/* Company Address and Registration Data */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">Firmeninformationen</h4>

          <div className="space-y-4">
            <div>
              <Label htmlFor="mainOfficeAddress">
                Anschrift des Sitzes der Hauptniederlassung
              </Label>
              <Input
                id="mainOfficeAddress"
                placeholder="z.B. Musterstraße 121, 12345 Musterstadt"
                value={formData.mainOfficeAddress || ""}
                onChange={(e) =>
                  handleFieldChange("mainOfficeAddress", e.target.value)
                }
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Bitte geben Sie die vollständige Adresse im Format "Straße
                Hausnummer, PLZ Ort" an.
              </p>
            </div>

            <div>
              <Label htmlFor="registrationNumber">Handelsregisternummer</Label>
              <Input
                id="registrationNumber"
                placeholder="z.B. HRB 123456 B"
                value={formData.registrationNumber || ""}
                onChange={(e) =>
                  handleFieldChange("registrationNumber", e.target.value)
                }
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Bitte geben Sie die vollständige Handelsregisternummer an.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Legal Representatives */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">Gesetzliche Vertreter</h4>
          <p className="text-sm text-muted-foreground">
            Bitte geben Sie alle gesetzlichen Vertreter / Mitglieder des
            Vertretungsorgans an (keine Prokuristen). Format: "Nachname,
            Vorname, *Geburtsdatum, Wohnort" (z.B. "Mustermann, Max,
            *03.05.1970, Musterstadt")
          </p>

          <div className="space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <Label htmlFor={`representative-${index}`}>
                  {index === 0
                    ? "1. Vertreter"
                    : `${index + 1}. Vertreter (optional)`}
                </Label>
                <Input
                  id={`representative-${index}`}
                  placeholder="Nachname, Vorname, *Geburtsdatum, Wohnort"
                  value={
                    (formData.representatives &&
                      formData.representatives[index]) ||
                    ""
                  }
                  onChange={(e) =>
                    handleRepresentativeChange(index, e.target.value)
                  }
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>

          {/* Representative Email for VideoIdent */}
          <div className="mt-4">
            <Label htmlFor="representativeEmail">
              E-Mail-Adresse für VideoIdent
            </Label>
            <Input
              id="representativeEmail"
              type="email"
              placeholder="email@example.com"
              value={formData.representativeEmail || ""}
              onChange={(e) =>
                handleFieldChange("representativeEmail", e.target.value)
              }
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Die Identitätsprüfung erfolgt durch ein Online-Videotelefonat
              (IDnow VideoIdent). Die hierfür erforderlichen Zugangsdaten
              erhalten Sie von uns in einer E-Mail, die an diese E-Mail-Adresse
              gesendet wird.
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Beneficial Owners */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">Wirtschaftlich Berechtigte</h4>
          <p className="text-sm text-muted-foreground">
            Bitte geben Sie Informationen zu den wirtschaftlich Berechtigten
            i.S.d. § 3 GwG an. Dies sind natürliche Personen, die mehr als 25%
            der Kapital- oder Stimmrechtsanteile halten.
          </p>

          {[0, 1, 2, 3, 4].map((rowIndex) => {
            const owner = (formData.beneficialOwners || [])[rowIndex] || {};

            return (
              <div key={rowIndex} className="mt-3 rounded-md border p-4">
                <h5 className="mb-3 font-medium">
                  {rowIndex === 0
                    ? "Wirtschaftlich Berechtigter"
                    : `Wirtschaftlich Berechtigter ${rowIndex + 1} (optional)`}
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`vorname-${rowIndex}`}>Vorname</Label>
                    <Input
                      id={`vorname-${rowIndex}`}
                      placeholder="Vorname"
                      value={owner.Vorname || ""}
                      onChange={(e) =>
                        handleBeneficialOwnerChange(
                          rowIndex,
                          "Vorname",
                          e.target.value,
                        )
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`nachname-${rowIndex}`}>Nachname</Label>
                    <Input
                      id={`nachname-${rowIndex}`}
                      placeholder="Nachname"
                      value={owner.Nachname || ""}
                      onChange={(e) =>
                        handleBeneficialOwnerChange(
                          rowIndex,
                          "Nachname",
                          e.target.value,
                        )
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`geburtsdatum-${rowIndex}`}>
                      Geburtsdatum
                    </Label>
                    <Input
                      id={`geburtsdatum-${rowIndex}`}
                      placeholder="TT.MM.JJJJ"
                      value={owner.Geburtsdatum || ""}
                      onChange={(e) =>
                        handleBeneficialOwnerChange(
                          rowIndex,
                          "Geburtsdatum",
                          e.target.value,
                        )
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`staatsbürgerschaft-${rowIndex}`}>
                      Staatsbürgerschaft
                    </Label>
                    <Input
                      id={`staatsbürgerschaft-${rowIndex}`}
                      placeholder="z.B. deutsch"
                      value={owner.Staatsbürgerschaft || ""}
                      onChange={(e) =>
                        handleBeneficialOwnerChange(
                          rowIndex,
                          "Staatsbürgerschaft",
                          e.target.value,
                        )
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />

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

          {/* Transparenzregisterauszug */}
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

          {/* Gewerbeanmeldung */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">3. Gewerbeanmeldung</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie die aktuelle Gewerbeanmeldung hoch.
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
