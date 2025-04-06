"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Upload, Info, FileText, Trash2 } from "lucide-react";
import { PepCheckComponent, IndustrySelect } from "./components";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [isRegistered, setIsRegistered] = useState<boolean | null>(
    formData.isRegistered !== undefined ? formData.isRegistered : null,
  );
  const [registerExtractFile, setRegisterExtractFile] = useState<File | null>(
    null,
  );
  const [alternativeDocumentFile, setAlternativeDocumentFile] =
    useState<File | null>(null);
  const [transparenzregisterFile, setTransparenzregisterFile] =
    useState<File | null>(null);
  const [representativeInfoFile, setRepresentativeInfoFile] =
    useState<File | null>(null);
  const [industry, setIndustry] = useState<string>(formData.industry || "");
  const [documentState, setDocumentState] = useState({
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
    hasLegalEntityRepresentative:
      formData.hasLegalEntityRepresentative || false,
  });

  const handleRegistrationChange = (value: string) => {
    const isReg = value === "registered";
    setIsRegistered(isReg);
    onFieldsChange({
      ...formData,
      isRegistered: isReg,
    });
  };

  const handleFileUpload = (type: string, file: File | null) => {
    if (!file) return;

    // In a real implementation, you would upload to storage
    // For now, just update the local state
    switch (type) {
      case "registerExtract":
        setRegisterExtractFile(file);
        onFieldsChange({
          ...formData,
          registerExtractFile: file.name,
          alternativeDocumentFile: null,
        });
        break;
      case "alternativeDocument":
        setAlternativeDocumentFile(file);
        onFieldsChange({
          ...formData,
          alternativeDocumentFile: file.name,
          registerExtractFile: null,
        });
        break;
      case "transparenzregister":
        setTransparenzregisterFile(file);
        onFieldsChange({
          ...formData,
          transparenzregisterFile: file.name,
        });
        break;
    }
  };

  const removeFile = (type: string) => {
    switch (type) {
      case "registerOrAlternative":
        setRegisterExtractFile(null);
        setAlternativeDocumentFile(null);
        onFieldsChange({
          ...formData,
          registerExtractFile: null,
          alternativeDocumentFile: null,
        });
        break;
      case "transparenzregister":
        setTransparenzregisterFile(null);
        onFieldsChange({
          ...formData,
          transparenzregisterFile: null,
        });
        break;
    }
  };

  const handleRepresentativeChange = (hasRep: boolean) => {
    setDocumentState({
      ...documentState,
      hasLegalEntityRepresentative: hasRep,
    });
    onFieldsChange({
      ...formData,
      hasLegalEntityRepresentative: hasRep,
    });
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    onFieldsChange({
      ...formData,
      industry: value,
    });
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
            <div className="mt-4 rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(
                    "registerExtract",
                    e.target.files?.[0] || null,
                  )
                }
                className="hidden"
                id="register-extract-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="register-extract-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {registerExtractFile
                    ? registerExtractFile.name
                    : "Registerauszug hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>
          )}

          {isRegistered === false && (
            <div className="mt-4 rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(
                    "alternativeDocument",
                    e.target.files?.[0] || null,
                  )
                }
                className="hidden"
                id="alternative-document-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="alternative-document-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {alternativeDocumentFile
                    ? alternativeDocumentFile.name
                    : "Gleichwertiges Dokument hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>
          )}

          {(registerExtractFile || alternativeDocumentFile) && (
            <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                <span>
                  {registerExtractFile
                    ? registerExtractFile.name
                    : alternativeDocumentFile?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile("registerOrAlternative")}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Entfernen
              </Button>
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-md mb-3 font-medium">
              Transparenzregisterauszug
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie einen aktuellen Transparenzregisterauszug hoch
              (nicht älter als 6 Wochen).
            </p>

            <div className="rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(
                    "transparenzregister",
                    e.target.files?.[0] || null,
                  )
                }
                className="hidden"
                id="legal-transparenzregister-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="legal-transparenzregister-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {transparenzregisterFile
                    ? transparenzregisterFile.name
                    : "Transparenzregisterauszug hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>

            {transparenzregisterFile && (
              <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  <span>{transparenzregisterFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile("transparenzregister")}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                </Button>
              </div>
            )}
          </div>

          {/* PEP Check Component */}
          <PepCheckComponent
            documentState={documentState}
            setDocumentState={handleDocumentStateChange}
            className="mt-6"
          />
        </div>
      </CardContent>
    </Card>
  );
};
