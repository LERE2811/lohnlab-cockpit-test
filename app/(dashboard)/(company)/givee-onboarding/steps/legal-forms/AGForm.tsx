"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Building2,
  Upload,
  FileCheck,
  Info,
  FileText,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TransparenzregisterInfoDialog, PepCheckComponent } from "./components";

interface AGFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
}

export const AGForm = ({ onFieldsChange, formData }: AGFormProps) => {
  const [handelregisterFile, setHandelregisterFile] = useState<File | null>(
    null,
  );
  const [transparenzregisterFile, setTransparenzregisterFile] =
    useState<File | null>(null);
  const [isListed, setIsListed] = useState<boolean | null>(
    formData.isListed || null,
  );
  const [stockExchange, setStockExchange] = useState<string | null>(
    formData.stockExchange || null,
  );
  const [otherStockExchange, setOtherStockExchange] = useState<string>(
    formData.otherStockExchange || "",
  );
  const [documentState, setDocumentState] = useState({
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  });

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
      case "transparenzregister":
        setTransparenzregisterFile(null);
        onFieldsChange({
          ...formData,
          transparenzregisterFile: null,
        });
        break;
    }
  };

  const handleListingChange = (value: boolean) => {
    setIsListed(value);
    onFieldsChange({
      ...formData,
      isListed: value,
    });
  };

  const handleStockExchangeChange = (value: string) => {
    setStockExchange(value);
    onFieldsChange({
      ...formData,
      stockExchange: value,
    });
  };

  const handleOtherStockExchangeChange = (value: string) => {
    setOtherStockExchange(value);
    onFieldsChange({
      ...formData,
      otherStockExchange: value,
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

          {/* Börsennotierungsprüfung */}
          <div className="mt-6">
            <h4 className="text-md mb-3 font-medium">
              2. Börsennotierung prüfen
            </h4>

            <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                <strong>Hilfestellung:</strong> Sie können die Börsennotierung
                überprüfen, indem Sie auf
                <a
                  href="https://www.bafin.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-1 text-blue-600 underline hover:text-blue-800"
                >
                  www.bafin.de
                </a>
                die{" "}
                <a
                  href="https://portal.mvp.bafin.de/database/DealingsInfo/sucheForm.do"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  BaFin-Datenbank
                </a>{" "}
                durchsuchen. Nutzen Sie dazu den Namen der AG oder die
                Wertpapierkennnummer (ISIN/WKN).
              </p>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              Ist die Aktiengesellschaft an einem organisierten Markt im Sinne
              von § 2 Abs. 11 WpHG notiert?
            </p>

            <div className="flex space-x-4">
              <Button
                variant={isListed === true ? "default" : "outline"}
                onClick={() => handleListingChange(true)}
                className="flex-1"
              >
                Ja, börsennotiert
              </Button>
              <Button
                variant={isListed === false ? "default" : "outline"}
                onClick={() => handleListingChange(false)}
                className="flex-1"
              >
                Nein, nicht börsennotiert
              </Button>
            </div>
          </div>

          {/* Bei börsennotierten AGs - Börsenmarkt angeben */}
          {isListed === true && (
            <div className="mt-6 rounded-lg border bg-gray-50 p-5">
              <h4 className="mb-3 border-b pb-2 text-lg font-medium">
                2. Börsenmarkt angeben
              </h4>
              <p className="mb-4 text-sm text-muted-foreground">
                An welchem organisierten Markt in einem Mitgliedstaat der
                Europäischen Union ist die AG notiert?
              </p>

              <RadioGroup
                value={stockExchange || ""}
                onValueChange={handleStockExchangeChange}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100">
                  <RadioGroupItem value="frankfurt" id="frankfurt" />
                  <Label htmlFor="frankfurt" className="font-medium">
                    Frankfurter Wertpapierbörse
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100">
                  <RadioGroupItem value="stuttgart" id="stuttgart" />
                  <Label htmlFor="stuttgart" className="font-medium">
                    Börse Stuttgart
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100">
                  <RadioGroupItem value="hamburg" id="hamburg" />
                  <Label htmlFor="hamburg" className="font-medium">
                    Hamburger Börse
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100">
                  <RadioGroupItem value="andere" id="andere" />
                  <Label htmlFor="andere" className="font-medium">
                    Andere
                  </Label>
                </div>
              </RadioGroup>

              {stockExchange === "andere" && (
                <div className="mt-4 space-y-2 rounded border bg-white p-3">
                  <Label htmlFor="other-exchange">
                    Bitte geben Sie die Börse an:
                  </Label>
                  <Input
                    id="other-exchange"
                    value={otherStockExchange}
                    onChange={(e) =>
                      handleOtherStockExchangeChange(e.target.value)
                    }
                    placeholder="Name der Börse eingeben"
                  />
                </div>
              )}
            </div>
          )}

          {/* Bei nicht börsennotierten AGs - Transparenzregisterauszug */}
          {isListed === false && (
            <div className="mt-6 rounded-lg border bg-gray-50 p-5">
              <div className="flex items-center gap-2">
                <h4 className="mb-3 border-b pb-2 text-lg font-medium">
                  2. Transparenzregisterauszug einreichen
                </h4>
                <TransparenzregisterInfoDialog />
              </div>
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
          )}

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
