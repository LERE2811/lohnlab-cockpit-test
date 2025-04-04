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

interface OtherFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm: string;
}

export const OtherForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: OtherFormProps) => {
  const [existenceProofFile, setExistenceProofFile] = useState<File | null>(
    null,
  );
  const [personalausweiseFile, setPersonalausweiseFile] = useState<File | null>(
    null,
  );
  const [transparenzregisterFile, setTransparenzregisterFile] =
    useState<File | null>(null);
  const [additionalDocsFile, setAdditionalDocsFile] = useState<File | null>(
    null,
  );

  const handleFileUpload = (type: string, file: File | null) => {
    if (!file) return;

    // In a real implementation, you would upload to storage
    // For now, just update the local state
    switch (type) {
      case "existenceProof":
        setExistenceProofFile(file);
        onFieldsChange({
          ...formData,
          existenceProofFile: file.name,
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
      case "additionalDocs":
        setAdditionalDocsFile(file);
        onFieldsChange({
          ...formData,
          additionalDocsFile: file.name,
        });
        break;
    }
  };

  const removeFile = (type: string) => {
    switch (type) {
      case "existenceProof":
        setExistenceProofFile(null);
        onFieldsChange({
          ...formData,
          existenceProofFile: null,
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
      case "additionalDocs":
        setAdditionalDocsFile(null);
        onFieldsChange({
          ...formData,
          additionalDocsFile: null,
        });
        break;
    }
  };

  // Function to get title based on legal form
  const getFormTitle = () => {
    if (legalForm.includes("KG") || legalForm.includes("OHG")) {
      return "Benötigte Unterlagen für Personengesellschaft";
    } else if (
      legalForm.includes("Einzelkaufmann") ||
      legalForm.includes("EK")
    ) {
      return "Benötigte Unterlagen für Einzelkaufmann";
    } else {
      return `Benötigte Unterlagen für ${legalForm || "Ihre Rechtsform"}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          {getFormTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für Ihre Rechtsform (
                {legalForm || "andere"}) benötigen wir Nachweise über die
                rechtliche Existenz und Identifikationsdokumente der
                vertretungsberechtigten Personen und wirtschaftlich
                Berechtigten.
              </p>
            </div>
          </div>
        </div>

        <Alert
          variant="default"
          className="mb-4 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
        >
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Für diese Rechtsform werden die grundlegenden Dokumente erfasst.
            Falls weitere spezifische Unterlagen benötigt werden, kontaktieren
            wir Sie nach Einreichung.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Existence Proof */}
          <div className="mt-4">
            <h4 className="text-md mb-3 font-medium">
              1. Nachweis der rechtlichen Existenz
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Nachweis über die Existenz und rechtliche Struktur (z.B.
              Handelsregisterauszug, Gewerbeanmeldung, Satzung).
            </p>

            <div className="rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(
                    "existenceProof",
                    e.target.files?.[0] || null,
                  )
                }
                className="hidden"
                id="existence-proof-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="existence-proof-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {existenceProofFile
                    ? existenceProofFile.name
                    : "Existenznachweis hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>

            {existenceProofFile && (
              <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  <span>{existenceProofFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile("existenceProof")}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                </Button>
              </div>
            )}
          </div>

          {/* Personalausweise */}
          <div className="mt-6">
            <h4 className="text-md mb-3 font-medium">
              2. Personalausweise der vertretungsberechtigten Personen
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Personalausweise oder Reisepässe aller vertretungsberechtigten
              Personen und wirtschaftlich Berechtigten (Anteil {">"}25%).
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
              3. Transparenzregisterauszug
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Transparenzregisterauszug (falls zutreffend).
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

          {/* Additional Documents */}
          <div className="mt-6">
            <h4 className="text-md mb-3 font-medium">4. Weitere Unterlagen</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Weitere relevante Unterlagen für Ihre Rechtsform (z.B.
              Gesellschaftsvertrag, Gesellschafterliste, etc.).
            </p>

            <div className="rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(
                    "additionalDocs",
                    e.target.files?.[0] || null,
                  )
                }
                className="hidden"
                id="additional-docs-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
              />
              <label
                htmlFor="additional-docs-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {additionalDocsFile
                    ? additionalDocsFile.name
                    : "Weitere Unterlagen hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>

            {additionalDocsFile && (
              <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  <span>{additionalDocsFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile("additionalDocs")}
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
