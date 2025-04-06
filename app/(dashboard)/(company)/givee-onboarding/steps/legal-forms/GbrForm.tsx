"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Upload, FileText, Trash2 } from "lucide-react";
import { PepCheckComponent, IndustrySelect } from "./components";

interface DocumentState {
  selectedType: string;
  gesellschaftsvertragFile: File | null;
  gewerbeanmeldungenFiles: File[];
  addressDiffers: boolean;
  addressProofDocument: File | null;
  hasPep: boolean;
  pepDetails: string;
}

interface GbrFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm?: string;
}

export const GbrForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: GbrFormProps) => {
  const [documentState, setDocumentState] = useState<DocumentState>({
    selectedType: formData.selectedType || "",
    gesellschaftsvertragFile: null,
    gewerbeanmeldungenFiles: formData.gewerbeanmeldungenFiles || [],
    addressDiffers: formData.addressDiffers || false,
    addressProofDocument: null,
    hasPep: formData.hasPep || false,
    pepDetails: formData.pepDetails || "",
  });
  const [industry, setIndustry] = useState<string>(formData.industry || "");

  // Get company address from formData
  const headquarterAddress = {
    adresse: formData.adresse || "Firmenadresse",
    plz: formData.plz || "PLZ",
    ort: formData.ort || "Ort",
  };

  const handleSelectedTypeChange = (value: string) => {
    setDocumentState({
      ...documentState,
      selectedType: value as "gesellschaftsvertrag" | "gewerbeanmeldungen",
    });

    onFieldsChange({
      ...formData,
      selectedType: value,
    });
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    onFieldsChange({
      ...formData,
      industry: value,
    });
  };

  const handleGesellschaftsvertragUpload = (file: File | null) => {
    if (!file) return;

    setDocumentState({
      ...documentState,
      gesellschaftsvertragFile: file,
    });

    onFieldsChange({
      ...formData,
      gesellschaftsvertragFile: file.name,
    });
  };

  const handleGewerbeanmeldungenUpload = (files: File[]) => {
    if (!files.length) return;

    const existingFiles = documentState.gewerbeanmeldungenFiles || [];
    const updatedFiles = [...existingFiles, ...files];

    setDocumentState({
      ...documentState,
      gewerbeanmeldungenFiles: updatedFiles,
    });

    onFieldsChange({
      ...formData,
      gewerbeanmeldungenFiles: updatedFiles.map((f) => f.name),
    });
  };

  const handleRemoveGesellschaftsvertrag = () => {
    setDocumentState({
      ...documentState,
      gesellschaftsvertragFile: null,
    });

    onFieldsChange({
      ...formData,
      gesellschaftsvertragFile: null,
    });
  };

  const handleRemoveGewerbeanmeldung = (index: number) => {
    const updatedFiles = documentState.gewerbeanmeldungenFiles.filter(
      (_, i) => i !== index,
    );

    setDocumentState({
      ...documentState,
      gewerbeanmeldungenFiles: updatedFiles,
    });

    onFieldsChange({
      ...formData,
      gewerbeanmeldungenFiles: updatedFiles.map((f) => f.name),
    });
  };

  const handleAddressDiffersChange = (differs: boolean) => {
    setDocumentState({
      ...documentState,
      addressDiffers: differs,
    });

    onFieldsChange({
      ...formData,
      addressDiffers: differs,
    });
  };

  const handleAddressProofUpload = (file: File | null) => {
    if (!file) return;

    setDocumentState({
      ...documentState,
      addressProofDocument: file,
    });

    onFieldsChange({
      ...formData,
      addressProofDocument: file.name,
    });
  };

  const handleRemoveAddressProof = () => {
    setDocumentState({
      ...documentState,
      addressProofDocument: null,
    });

    onFieldsChange({
      ...formData,
      addressProofDocument: null,
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
      hasPep: newState.hasPep,
      pepDetails: newState.pepDetails,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          GbR - Nachweisdokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4">
          <h4 className="mb-2 text-base font-medium">GbR-Nachweisdokumente</h4>
          <p className="mb-4 text-sm text-slate-500">
            Bitte wählen Sie aus, welches Dokument Sie einreichen möchten und
            laden Sie die entsprechenden Nachweise hoch.
          </p>
        </div>

        {/* Industry Category Selection */}
        <IndustrySelect
          value={industry}
          onChange={handleIndustryChange}
          className="mb-6"
        />

        <div className="space-y-4">
          <RadioGroup
            value={documentState.selectedType}
            onValueChange={handleSelectedTypeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="gesellschaftsvertrag"
                id="gesellschaftsvertrag"
              />
              <Label htmlFor="gesellschaftsvertrag">Gesellschaftsvertrag</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="gewerbeanmeldungen"
                id="gewerbeanmeldungen"
              />
              <Label htmlFor="gewerbeanmeldungen">
                Gewerbeanmeldungen aller Gesellschafter
              </Label>
            </div>
          </RadioGroup>

          {documentState.selectedType === "gesellschaftsvertrag" && (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed bg-white p-4">
                <input
                  type="file"
                  onChange={(e) =>
                    handleGesellschaftsvertragUpload(
                      e.target.files?.[0] || null,
                    )
                  }
                  className="hidden"
                  id="gesellschaftsvertrag-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="gesellschaftsvertrag-upload"
                  className="flex cursor-pointer flex-col items-center"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">
                    {documentState.gesellschaftsvertragFile
                      ? documentState.gesellschaftsvertragFile.name
                      : "Gesellschaftsvertrag hochladen"}
                  </span>
                </label>
              </div>

              {documentState.gesellschaftsvertragFile && (
                <div className="flex items-center justify-between rounded bg-gray-50 p-2">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                    <span>{documentState.gesellschaftsvertragFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveGesellschaftsvertrag}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                  </Button>
                </div>
              )}
            </div>
          )}

          {documentState.selectedType === "gewerbeanmeldungen" && (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed bg-white p-4">
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleGewerbeanmeldungenUpload(Array.from(files));
                    }
                  }}
                  className="hidden"
                  id="gewerbeanmeldungen-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="gewerbeanmeldungen-upload"
                  className="flex cursor-pointer flex-col items-center"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">
                    Gewerbeanmeldungen hochladen
                  </span>
                </label>
              </div>

              {documentState.gewerbeanmeldungenFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Hochgeladene Dokumente:</Label>
                  <div className="space-y-1">
                    {documentState.gewerbeanmeldungenFiles.map(
                      (file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded bg-gray-50 p-2"
                        >
                          <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-blue-600" />
                            <span>{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveGewerbeanmeldung(index)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {documentState.gewerbeanmeldungenFiles.length > 0 && (
                <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                  <div className="space-y-2">
                    <Label>Aktuelle Firmenadresse:</Label>
                    <div className="text-sm">
                      {headquarterAddress.adresse}
                      <br />
                      {headquarterAddress.plz} {headquarterAddress.ort}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Weicht die aktuelle Firmenadresse von den
                      Gewerbeanmeldungen ab?
                    </Label>
                    <div className="flex space-x-4">
                      <Button
                        variant={
                          documentState.addressDiffers ? "default" : "outline"
                        }
                        onClick={() => handleAddressDiffersChange(true)}
                      >
                        Ja
                      </Button>
                      <Button
                        variant={
                          documentState.addressDiffers === false
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleAddressDiffersChange(false)}
                      >
                        Nein
                      </Button>
                    </div>
                  </div>

                  {documentState.addressDiffers && (
                    <div className="space-y-2">
                      <Label>Adressnachweis hochladen</Label>
                      <div className="rounded-lg border-2 border-dashed bg-white p-4">
                        <input
                          type="file"
                          onChange={(e) =>
                            handleAddressProofUpload(
                              e.target.files?.[0] || null,
                            )
                          }
                          className="hidden"
                          id="address-proof-upload"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="address-proof-upload"
                          className="flex cursor-pointer flex-col items-center"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">
                            Adressnachweis hochladen (z.B. aktuelle
                            Stromrechnung)
                          </span>
                        </label>
                      </div>
                      {documentState.addressProofDocument && (
                        <div className="flex items-center justify-between rounded bg-gray-50 p-2">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-blue-600" />
                            <span>
                              {documentState.addressProofDocument.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveAddressProof}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Entfernen
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
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
