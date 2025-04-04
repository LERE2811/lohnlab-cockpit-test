"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2, Upload, Info, FileText, Trash2 } from "lucide-react";
import { PepCheckComponent } from "./components";

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
  const [isRegistered, setIsRegistered] = useState<boolean | null>(
    formData.isRegistered || null,
  );
  const [registerFile, setRegisterFile] = useState<File | null>(null);
  const [satzungFile, setSatzungFile] = useState<File | null>(null);
  const [protokollFile, setProtokollFile] = useState<File | null>(null);
  const [transparenzregisterFile, setTransparenzregisterFile] =
    useState<File | null>(null);
  const [documentState, setDocumentState] = useState({
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  });

  // Determine if it's a Verein or Genossenschaft
  const isVerein = legalForm.includes("V.");
  const formTitle = isVerein
    ? "Eingetragener Verein"
    : "Eingetragene Genossenschaft";
  const registerType = isVerein ? "Vereinsregister" : "Genossenschaftsregister";

  const handleFileUpload = (type: string, file: File | null) => {
    if (!file) return;

    // In a real implementation, you would upload to storage
    // For now, just update the local state
    switch (type) {
      case "register":
        setRegisterFile(file);
        onFieldsChange({
          ...formData,
          registerFile: file.name,
          registerType: isVerein
            ? "vereinsregister"
            : "genossenschaftsregister",
        });
        break;
      case "satzung":
        setSatzungFile(file);
        onFieldsChange({
          ...formData,
          satzungFile: file.name,
        });
        break;
      case "protokoll":
        setProtokollFile(file);
        onFieldsChange({
          ...formData,
          protokollFile: file.name,
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
      case "register":
        setRegisterFile(null);
        onFieldsChange({
          ...formData,
          registerFile: null,
        });
        break;
      case "satzung":
        setSatzungFile(null);
        onFieldsChange({
          ...formData,
          satzungFile: null,
        });
        break;
      case "protokoll":
        setProtokollFile(null);
        onFieldsChange({
          ...formData,
          protokollFile: null,
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

  const handleRegisteredChange = (value: boolean) => {
    setIsRegistered(value);
    onFieldsChange({
      ...formData,
      isRegistered: value,
      registerType:
        value && (isVerein ? "vereinsregister" : "genossenschaftsregister"),
    });
  };

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
              <h4 className="text-md mb-3 font-medium">{registerType}auszug</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Bitte laden Sie einen aktuellen {registerType}auszug hoch (nicht
                älter als 6 Monate).
              </p>

              <div className="rounded-lg border-2 border-dashed bg-white p-6">
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileUpload("register", e.target.files?.[0] || null)
                  }
                  className="hidden"
                  id="register-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="register-upload"
                  className="flex cursor-pointer flex-col items-center"
                >
                  <Upload className="mb-2 h-10 w-10 text-gray-400" />
                  <span className="mt-2 text-sm font-medium text-gray-700">
                    {registerFile
                      ? registerFile.name
                      : `${registerType}auszug hochladen`}
                  </span>
                  <span className="mt-1 text-xs text-gray-500">
                    Klicken Sie hier, um eine Datei auszuwählen
                  </span>
                </label>
              </div>

              {registerFile && (
                <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                    <span>{registerFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile("register")}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                  </Button>
                </div>
              )}
            </div>
          )}

          {isRegistered === false && (
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-md mb-3 font-medium">Satzung</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Bitte laden Sie die aktuelle Satzung hoch.
                </p>

                <div className="rounded-lg border-2 border-dashed bg-white p-6">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload("satzung", e.target.files?.[0] || null)
                    }
                    className="hidden"
                    id="satzung-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="satzung-upload"
                    className="flex cursor-pointer flex-col items-center"
                  >
                    <Upload className="mb-2 h-10 w-10 text-gray-400" />
                    <span className="mt-2 text-sm font-medium text-gray-700">
                      {satzungFile ? satzungFile.name : "Satzung hochladen"}
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      Klicken Sie hier, um eine Datei auszuwählen
                    </span>
                  </label>
                </div>

                {satzungFile && (
                  <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-blue-600" />
                      <span>{satzungFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile("satzung")}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-md mb-3 font-medium">
                  Protokoll der letzten Mitgliederversammlung
                </h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Bitte laden Sie das Protokoll der letzten
                  Mitgliederversammlung hoch.
                </p>

                <div className="rounded-lg border-2 border-dashed bg-white p-6">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload("protokoll", e.target.files?.[0] || null)
                    }
                    className="hidden"
                    id="protokoll-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="protokoll-upload"
                    className="flex cursor-pointer flex-col items-center"
                  >
                    <Upload className="mb-2 h-10 w-10 text-gray-400" />
                    <span className="mt-2 text-sm font-medium text-gray-700">
                      {protokollFile
                        ? protokollFile.name
                        : "Protokoll hochladen"}
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      Klicken Sie hier, um eine Datei auszuwählen
                    </span>
                  </label>
                </div>

                {protokollFile && (
                  <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-blue-600" />
                      <span>{protokollFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile("protokoll")}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                    </Button>
                  </div>
                )}
              </div>
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
                id="verein-transparenz-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="verein-transparenz-upload"
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
