"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Upload,
  FileCheck,
  Info,
  FileText,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GmbHFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
}

export const GmbHForm = ({ onFieldsChange, formData }: GmbHFormProps) => {
  const [handelregisterFile, setHandelregisterFile] = useState<File | null>(
    null,
  );
  const [gesellschafterlisteFile, setGesellschafterlisteFile] =
    useState<File | null>(null);
  const [personalausweiseFile, setPersonalausweiseFile] = useState<File | null>(
    null,
  );
  const [transparenzregisterFile, setTransparenzregisterFile] =
    useState<File | null>(null);

  const handleFileUpload = (type: string, file: File | null) => {
    if (!file) return;

    // In a real implementation, you would upload to storage
    // For now, just update the local state
    switch (type) {
      case "handelregister":
        setHandelregisterFile(file);
        onFieldsChange({
          ...formData,
          handelregisterFile: file.name,
        });
        break;
      case "gesellschafterliste":
        setGesellschafterlisteFile(file);
        onFieldsChange({
          ...formData,
          gesellschafterlisteFile: file.name,
        });
        break;
      case "personalausweise":
        setPersonalausweiseFile(file);
        onFieldsChange({
          ...formData,
          personalausweiseFile: file.name,
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
      case "handelregister":
        setHandelregisterFile(null);
        onFieldsChange({
          ...formData,
          handelregisterFile: null,
        });
        break;
      case "gesellschafterliste":
        setGesellschafterlisteFile(null);
        onFieldsChange({
          ...formData,
          gesellschafterlisteFile: null,
        });
        break;
      case "personalausweise":
        setPersonalausweiseFile(null);
        onFieldsChange({
          ...formData,
          personalausweiseFile: null,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          Benötigte Unterlagen für GmbH
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für GmbH benötigen wir einen aktuellen
                Handelsregisterauszug, eine Gesellschafterliste und einen
                Transparenzregisterauszug, um die wirtschaftlich Berechtigten zu
                identifizieren.
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
                    "handelregister",
                    e.target.files?.[0] || null,
                  )
                }
                className="hidden"
                id="handelregister-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="handelregister-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {handelregisterFile
                    ? handelregisterFile.name
                    : "Handelsregisterauszug hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>

            {handelregisterFile && (
              <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  <span>{handelregisterFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile("handelregister")}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                </Button>
              </div>
            )}
          </div>

          {/* Gesellschafterliste */}
          <div className="mt-6">
            <h4 className="text-md mb-3 font-medium">2. Gesellschafterliste</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Gesellschafterliste mit aktuellen Beteiligungsverhältnissen.
            </p>

            <div className="rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(
                    "gesellschafterliste",
                    e.target.files?.[0] || null,
                  )
                }
                className="hidden"
                id="gesellschafterliste-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="gesellschafterliste-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {gesellschafterlisteFile
                    ? gesellschafterlisteFile.name
                    : "Gesellschafterliste hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>

            {gesellschafterlisteFile && (
              <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  <span>{gesellschafterlisteFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile("gesellschafterliste")}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                </Button>
              </div>
            )}
          </div>

          {/* Personalausweise */}
          <div className="mt-6">
            <h4 className="text-md mb-3 font-medium">
              3. Personalausweise der Geschäftsführung und wirtschaftlich
              Berechtigten
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Personalausweise oder Reisepässe aller Geschäftsführer und
              wirtschaftlich Berechtigten (Anteil {">"}25%).
            </p>

            <div className="rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(
                    "personalausweise",
                    e.target.files?.[0] || null,
                  )
                }
                className="hidden"
                id="personalausweise-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
              />
              <label
                htmlFor="personalausweise-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {personalausweiseFile
                    ? personalausweiseFile.name
                    : "Personalausweise hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>

            {personalausweiseFile && (
              <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  <span>{personalausweiseFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile("personalausweise")}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                </Button>
              </div>
            )}
          </div>

          {/* Transparenzregister */}
          <div className="mt-6">
            <h4 className="text-md mb-3 font-medium">
              4. Transparenzregisterauszug
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Transparenzregisterauszug (falls vorhanden).
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
                id="transparenzregister-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="transparenzregister-upload"
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
        </div>
      </CardContent>
    </Card>
  );
};
