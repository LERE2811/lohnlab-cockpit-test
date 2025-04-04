"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Upload, Info, FileText, Trash2 } from "lucide-react";
import { PepCheckComponent } from "./components";

interface KdoerFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
}

export const KdoerForm = ({ onFieldsChange, formData }: KdoerFormProps) => {
  const [satzungFile, setSatzungFile] = useState<File | null>(null);
  const [documentState, setDocumentState] = useState({
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  });

  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    setSatzungFile(file);
    onFieldsChange({
      ...formData,
      satzungFile: file.name,
    });
  };

  const removeFile = () => {
    setSatzungFile(null);
    onFieldsChange({
      ...formData,
      satzungFile: null,
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
          Körperschaft des öffentlichen Rechts - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für Körperschaften des öffentlichen
                Rechts benötigen wir die Satzung bzw. den Errichtungsakt als
                Nachweis.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Satzung */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">Satzung</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie die aktuelle Satzung oder den Errichtungsakt hoch.
            </p>

            <div className="rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                className="hidden"
                id="kdoer-satzung-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="kdoer-satzung-upload"
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
                <Button variant="ghost" size="sm" onClick={removeFile}>
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
