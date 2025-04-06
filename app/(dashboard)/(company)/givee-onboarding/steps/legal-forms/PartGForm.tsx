"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Upload, Info, FileText, Trash2 } from "lucide-react";
import { PepCheckComponent, IndustrySelect } from "./components";

interface PartGFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm: string;
}

export const PartGForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: PartGFormProps) => {
  const [dokumente, setDokumente] = useState<Record<string, File | null>>({
    partnerschaftsregister: null,
    partnerschaftsvertrag: null,
  });
  const [industry, setIndustry] = useState<string>(formData.industry || "");
  const [documentState, setDocumentState] = useState({
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  });

  // Determine the full legal form name based on the provided legalForm
  const getFormattedLegalForm = () => {
    if (legalForm.includes("mbB")) {
      return "Partnerschaftsgesellschaft mit beschränkter Berufshaftung";
    }
    return "Partnerschaftsgesellschaft";
  };

  const formType = getFormattedLegalForm();

  const handleFileUpload = (type: string, file: File | null) => {
    if (!file) return;

    // In a real implementation, you would upload to storage
    // For now, just update the local state
    switch (type) {
      case "partnerschaftsregister":
        setDokumente({
          ...dokumente,
          partnerschaftsregister: file,
        });
        onFieldsChange({
          ...formData,
          partnerschaftsregisterFile: file.name,
        });
        break;
      case "transparenzregister":
        setDokumente({
          ...dokumente,
          partnerschaftsvertrag: file,
        });
        onFieldsChange({
          ...formData,
          partnerschaftsvertragFile: file.name,
        });
        break;
    }
  };

  const removeFile = (type: string) => {
    switch (type) {
      case "partnerschaftsregister":
        setDokumente({
          ...dokumente,
          partnerschaftsregister: null,
        });
        onFieldsChange({
          ...formData,
          partnerschaftsregisterFile: null,
        });
        break;
      case "transparenzregister":
        setDokumente({
          ...dokumente,
          partnerschaftsvertrag: null,
        });
        onFieldsChange({
          ...formData,
          partnerschaftsvertragFile: null,
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

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    onFieldsChange({
      ...formData,
      industry: value,
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
                <strong>Hinweis:</strong> Für {formType} benötigen wir einen
                aktuellen Partnerschaftsregisterauszug sowie einen
                Transparenzregisterauszug.
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
          {/* Partnerschaftsregisterauszug */}
          <div>
            <h4 className="text-md mb-3 font-medium">
              1. Partnerschaftsregisterauszug
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte laden Sie einen aktuellen Partnerschaftsregisterauszug hoch
              (nicht älter als 6 Monate).
            </p>

            <div className="rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(
                    "partnerschaftsregister",
                    e.target.files?.[0] || null,
                  )
                }
                className="hidden"
                id="partg-register-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="partg-register-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {dokumente.partnerschaftsregister
                    ? dokumente.partnerschaftsregister.name
                    : "Partnerschaftsregisterauszug hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>

            {dokumente.partnerschaftsregister && (
              <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  <span>{dokumente.partnerschaftsregister.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile("partnerschaftsregister")}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                </Button>
              </div>
            )}
          </div>

          {/* Transparenzregisterauszug */}
          <div>
            <h4 className="text-md mb-3 font-medium">
              2. Transparenzregisterauszug
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
                id="partg-transparenz-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="partg-transparenz-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {dokumente.partnerschaftsvertrag
                    ? dokumente.partnerschaftsvertrag.name
                    : "Transparenzregisterauszug hochladen"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Klicken Sie hier, um eine Datei auszuwählen
                </span>
              </label>
            </div>

            {dokumente.partnerschaftsvertrag && (
              <div className="mt-4 flex items-center justify-between rounded border bg-white p-3">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  <span>{dokumente.partnerschaftsvertrag.name}</span>
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
