"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2, Upload, Info, FileText, Trash2 } from "lucide-react";
import { TransparenzregisterInfoDialog, PepCheckComponent } from "./components";

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
  const [handelsregisterFile, setHandelsregisterFile] = useState<File | null>(
    null,
  );
  const [
    representativeHandelsregisterFile,
    setRepresentativeHandelsregisterFile,
  ] = useState<File | null>(null);
  const [transparenzregisterFile, setTransparenzregisterFile] =
    useState<File | null>(null);
  const [hasLegalEntityRepresentative, setHasLegalEntityRepresentative] =
    useState<boolean | null>(formData.hasLegalEntityRepresentative || null);
  const [documentState, setDocumentState] = useState({
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  });

  const formType = legalForm || "Personengesellschaft";

  const handleFileUpload = (type: string, file: File | null) => {
    if (!file) return;

    // In a real implementation, you would upload to storage
    // For now, just update the local state
    switch (type) {
      case "handelsregister":
        setHandelsregisterFile(file);
        onFieldsChange({
          ...formData,
          handelsregisterFile: file.name,
        });
        break;
      case "representativeHandelsregister":
        setRepresentativeHandelsregisterFile(file);
        onFieldsChange({
          ...formData,
          representativeHandelsregisterFile: file.name,
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
      case "handelsregister":
        setHandelsregisterFile(null);
        onFieldsChange({
          ...formData,
          handelsregisterFile: null,
        });
        break;
      case "representativeHandelsregister":
        setRepresentativeHandelsregisterFile(null);
        onFieldsChange({
          ...formData,
          representativeHandelsregisterFile: null,
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

  // Update parent form data when PEP information changes
  const handleDocumentStateChange = (newState: any) => {
    setDocumentState(newState);
    onFieldsChange({
      ...formData,
      hasPep: newState.hasPep,
      pepDetails: newState.pepDetails,
    });
  };

  const handleLegalEntityRepresentativeChange = (value: boolean) => {
    setHasLegalEntityRepresentative(value);
    onFieldsChange({
      ...formData,
      hasLegalEntityRepresentative: value,
    });
  };

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

            <div className="rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(
                    "handelsregister",
                    e.target.files?.[0] || null,
                  )
                }
                className="hidden"
                id="kg-handelsregister-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="kg-handelsregister-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {handelsregisterFile
                    ? handelsregisterFile.name
                    : "Handelsregisterauszug hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>

            {handelsregisterFile && (
              <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  <span>{handelsregisterFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile("handelsregister")}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                </Button>
              </div>
            )}
          </div>

          {/* Juristische Person als Vertreter prüfen */}
          <div className="mt-6 space-y-4">
            <h4 className="text-md mb-3 font-medium">
              2. Juristische Person als Vertreter prüfen
            </h4>

            <div className="space-y-2">
              <Label>
                Ist ein gesetzlicher Vertreter oder ein Mitglied des
                Vertretungsorgans eine juristische Person?
              </Label>
              <div className="flex space-x-4">
                <Button
                  variant={
                    hasLegalEntityRepresentative === true
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleLegalEntityRepresentativeChange(true)}
                >
                  Ja
                </Button>
                <Button
                  variant={
                    hasLegalEntityRepresentative === false
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleLegalEntityRepresentativeChange(false)}
                >
                  Nein
                </Button>
              </div>
            </div>

            {hasLegalEntityRepresentative === true && (
              <div className="mt-4">
                <p className="mb-4 text-sm text-muted-foreground">
                  Bitte laden Sie einen aktuellen Handelsregisterauszug der
                  juristischen Person hoch (nicht älter als 6 Monate).
                </p>

                <div className="rounded-lg border-2 border-dashed bg-white p-6">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload(
                        "representativeHandelsregister",
                        e.target.files?.[0] || null,
                      )
                    }
                    className="hidden"
                    id="representative-hr-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="representative-hr-upload"
                    className="flex cursor-pointer flex-col items-center"
                  >
                    <Upload className="mb-2 h-10 w-10 text-gray-400" />
                    <span className="mt-2 text-sm font-medium text-gray-700">
                      {representativeHandelsregisterFile
                        ? representativeHandelsregisterFile.name
                        : "Handelsregisterauszug der juristischen Person hochladen"}
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      Klicken Sie hier, um eine Datei auszuwählen
                    </span>
                  </label>
                </div>

                {representativeHandelsregisterFile && (
                  <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-blue-600" />
                      <span>{representativeHandelsregisterFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeFile("representativeHandelsregister")
                      }
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transparenzregisterauszug */}
          <div className="mt-6">
            <h4 className="text-md mb-3 font-medium">
              3. Transparenzregisterauszug
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
                id="kg-transparenzregister-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="kg-transparenzregister-upload"
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
