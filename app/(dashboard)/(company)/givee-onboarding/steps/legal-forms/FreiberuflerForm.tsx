"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, Info, Upload, FileText, Trash2 } from "lucide-react";
import { PepCheckComponent, IndustrySelect } from "./components";

interface FreiberuflerFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
  legalForm?: string;
}

export const FreiberuflerForm = ({
  onFieldsChange,
  formData,
  legalForm,
}: FreiberuflerFormProps) => {
  const [addressVerificationFile, setAddressVerificationFile] =
    useState<File | null>(null);
  const [industry, setIndustry] = useState<string>(formData.industry || "");
  const [documentState, setDocumentState] = useState({
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
          Freiberufler - Identifizierung des Vertragspartners
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Gemäß §§ 11 Abs. 4 Nr. 1, 12, 13 GwG
                und Auslegungs- und Anwendungshinweise Ziffer 5.1.3 benötigen
                wir zur Identifizierung Ihre persönlichen Daten.
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
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-medium">Persönliche Daten</h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  value={documentState.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={documentState.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Geburtsdatum</Label>
                <Input
                  id="birthDate"
                  placeholder="TT.MM.JJJJ"
                  value={documentState.birthDate}
                  onChange={(e) =>
                    handleInputChange("birthDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthPlace">Geburtsort</Label>
                <Input
                  id="birthPlace"
                  value={documentState.birthPlace}
                  onChange={(e) =>
                    handleInputChange("birthPlace", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Staatsangehörigkeit</Label>
                <Input
                  id="nationality"
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
                <Label htmlFor="street">Straße</Label>
                <Input
                  id="street"
                  value={documentState.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="houseNumber">Hausnummer</Label>
                <Input
                  id="houseNumber"
                  value={documentState.houseNumber}
                  onChange={(e) =>
                    handleInputChange("houseNumber", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">PLZ</Label>
                <Input
                  id="postalCode"
                  value={documentState.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ort</Label>
                <Input
                  id="city"
                  value={documentState.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
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
