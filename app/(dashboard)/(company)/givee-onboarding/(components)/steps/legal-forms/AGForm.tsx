"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TransparenzregisterInfoDialog,
  PepCheckComponent,
  IndustrySelect,
} from "./components";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";

interface AGFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm?: string;
}

export const AGForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: AGFormProps) => {
  const { subsidiary } = useCompany();
  const industry = formData.industry || "";
  const isListed =
    formData.isListed === true || formData.isListed === false
      ? formData.isListed
      : null;
  const stockExchange = formData.stockExchange || "";
  const otherStockExchange = formData.otherStockExchange || "";
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

  const handleListingChange = (value: string) => {
    onFieldsChange({
      ...formData,
      isListed: value === "yes",
      // Reset stock exchange related fields when changing listing status
      stockExchange: value === "no" ? "" : formData.stockExchange,
      otherStockExchange: value === "no" ? "" : formData.otherStockExchange,
    });
  };

  const handleStockExchangeChange = (value: string) => {
    onFieldsChange({
      ...formData,
      stockExchange: value,
    });
  };

  const handleOtherStockExchangeChange = (value: string) => {
    onFieldsChange({
      ...formData,
      otherStockExchange: value,
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
          AG - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für Aktiengesellschaften benötigen wir
                einen aktuellen Handelsregisterauszug sowie zusätzliche
                Informationen abhängig von der Börsennotierung.
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

          {/* Börsennotierung */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">2. Börsennotierung</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte geben Sie an, ob Ihre AG börsennotiert ist.
            </p>

            <RadioGroup
              value={isListed === true ? "yes" : isListed === false ? "no" : ""}
              onValueChange={handleListingChange}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="listing-yes" />
                <Label htmlFor="listing-yes">Ja, börsennotiert</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="listing-no" />
                <Label htmlFor="listing-no">Nein, nicht börsennotiert</Label>
              </div>
            </RadioGroup>

            {isListed && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label>An welcher Börse ist Ihre AG notiert?</Label>
                  <RadioGroup
                    value={stockExchange || ""}
                    onValueChange={handleStockExchangeChange}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dax" id="dax" />
                      <Label htmlFor="dax">DAX</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mdax" id="mdax" />
                      <Label htmlFor="mdax">MDAX</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sdax" id="sdax" />
                      <Label htmlFor="sdax">SDAX</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tecdax" id="tecdax" />
                      <Label htmlFor="tecdax">TecDAX</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Andere</Label>
                    </div>
                  </RadioGroup>
                </div>

                {stockExchange === "other" && (
                  <div>
                    <Label htmlFor="other-exchange">
                      Bitte geben Sie die Börse an
                    </Label>
                    <Input
                      id="other-exchange"
                      value={otherStockExchange}
                      onChange={(e) =>
                        handleOtherStockExchangeChange(e.target.value)
                      }
                      placeholder="z.B. NYSE, NASDAQ"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transparenzregister (nur wenn nicht börsennotiert) */}
          {isListed === false && (
            <div className="mt-4">
              <h4 className="text-md mb-3 font-medium">
                3. Transparenzregisterauszug
              </h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Da Ihre AG nicht börsennotiert ist, benötigen wir einen
                Transparenzregisterauszug zur Identifizierung der wirtschaftlich
                Berechtigten.
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
          )}

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
