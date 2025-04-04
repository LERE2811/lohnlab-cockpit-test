"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, Upload, Info, FileText, Trash2 } from "lucide-react";
import { PepCheckComponent } from "./components";

interface EkFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
}

export const EkForm = ({ onFieldsChange, formData }: EkFormProps) => {
  const [handelsregisterFile, setHandelsregisterFile] = useState<File | null>(
    null,
  );
  const [documentState, setDocumentState] = useState({
    handelsregisterNumber: formData.handelsregisterNumber || "",
    firstName: formData.firstName || "",
    lastName: formData.lastName || "",
    birthDate: formData.birthDate || "",
    birthPlace: formData.birthPlace || "",
    nationality: formData.nationality || "",
    street: formData.street || "",
    houseNumber: formData.houseNumber || "",
    postalCode: formData.postalCode || "",
    city: formData.city || "",
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  });

  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    setHandelsregisterFile(file);
    onFieldsChange({
      ...formData,
      ...documentState,
      handelsregisterFile: file.name,
    });
  };

  const removeFile = () => {
    setHandelsregisterFile(null);
    onFieldsChange({
      ...formData,
      ...documentState,
      handelsregisterFile: null,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    const updatedState = {
      ...documentState,
      [field]: value,
    };

    setDocumentState(updatedState);
    onFieldsChange({
      ...formData,
      ...updatedState,
    });
  };

  // Update parent form data when PEP information changes
  const handleDocumentStateChange = (newState: any) => {
    const updatedState = {
      ...documentState,
      hasPep: newState.hasPep,
      pepDetails: newState.pepDetails,
    };

    setDocumentState(updatedState);
    onFieldsChange({
      ...formData,
      ...updatedState,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          Eingetragener Kaufmann (e.K.) - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Für einen eingetragenen Kaufmann
                benötigen wir den Handelsregisterauszug sowie persönliche
                Informationen zur Identifikation.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-md mb-3 font-medium">Handelsregisterauszug</h4>
            <div className="rounded-lg border-2 border-dashed bg-white p-6">
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                className="hidden"
                id="ek-hr-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="ek-hr-upload"
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
                <Button variant="ghost" size="sm" onClick={removeFile}>
                  <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="handelsregisterNummer-ek">
              Handelsregisternummer
            </Label>
            <Input
              id="handelsregisterNummer-ek"
              value={documentState.handelsregisterNumber}
              onChange={(e) =>
                handleInputChange("handelsregisterNumber", e.target.value)
              }
              placeholder="z.B. HRA 12345"
            />
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="text-md mb-3 font-medium">Persönliche Daten</h4>

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">Persönliche Daten eingeben</h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName-ek-reg">Vorname</Label>
                  <Input
                    id="firstName-ek-reg"
                    value={documentState.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName-ek-reg">Nachname</Label>
                  <Input
                    id="lastName-ek-reg"
                    value={documentState.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate-ek-reg">Geburtsdatum</Label>
                  <Input
                    id="birthDate-ek-reg"
                    placeholder="TT.MM.JJJJ"
                    value={documentState.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthPlace-ek-reg">Geburtsort</Label>
                  <Input
                    id="birthPlace-ek-reg"
                    value={documentState.birthPlace}
                    onChange={(e) =>
                      handleInputChange("birthPlace", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality-ek-reg">
                    Staatsangehörigkeit
                  </Label>
                  <Input
                    id="nationality-ek-reg"
                    value={documentState.nationality}
                    onChange={(e) =>
                      handleInputChange("nationality", e.target.value)
                    }
                  />
                </div>
              </div>

              <h4 className="mt-4 font-medium">Wohnanschrift</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="street-ek-reg">Straße</Label>
                  <Input
                    id="street-ek-reg"
                    value={documentState.street}
                    onChange={(e) =>
                      handleInputChange("street", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="houseNumber-ek-reg">Hausnummer</Label>
                  <Input
                    id="houseNumber-ek-reg"
                    value={documentState.houseNumber}
                    onChange={(e) =>
                      handleInputChange("houseNumber", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode-ek-reg">PLZ</Label>
                  <Input
                    id="postalCode-ek-reg"
                    value={documentState.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city-ek-reg">Ort</Label>
                  <Input
                    id="city-ek-reg"
                    value={documentState.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
              </div>
            </div>
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
