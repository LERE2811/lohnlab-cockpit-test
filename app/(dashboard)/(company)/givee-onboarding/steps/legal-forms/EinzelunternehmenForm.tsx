"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, Info } from "lucide-react";
import { PepCheckComponent } from "./components";

interface EinzelunternehmenFormProps {
  onFieldsChange: (fields: any) => void;
  formData: any;
}

export const EinzelunternehmenForm = ({
  onFieldsChange,
  formData,
}: EinzelunternehmenFormProps) => {
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
          Einzelunternehmen - Benötigte Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Hinweis:</strong> Zur Identifizierung des
                Vertragspartners benötigen wir gemäß §§ 11 Abs. 4 Nr. 1, 12, 13
                GwG; Auslegungs- und Anwendungshinweise Ziffer 5.1.3 die unten
                aufgeführten Informationen.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="mt-6 space-y-4">
            <h4 className="text-md mb-3 font-medium">Persönliche Daten</h4>

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">Persönliche Daten eingeben</h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName-ek">Vorname</Label>
                  <Input
                    id="firstName-ek"
                    value={documentState.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName-ek">Nachname</Label>
                  <Input
                    id="lastName-ek"
                    value={documentState.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate-ek">Geburtsdatum</Label>
                  <Input
                    id="birthDate-ek"
                    placeholder="TT.MM.JJJJ"
                    value={documentState.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthPlace-ek">Geburtsort</Label>
                  <Input
                    id="birthPlace-ek"
                    value={documentState.birthPlace}
                    onChange={(e) =>
                      handleInputChange("birthPlace", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality-ek">Staatsangehörigkeit</Label>
                  <Input
                    id="nationality-ek"
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
                  <Label htmlFor="street-ek">Straße</Label>
                  <Input
                    id="street-ek"
                    value={documentState.street}
                    onChange={(e) =>
                      handleInputChange("street", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="houseNumber-ek">Hausnummer</Label>
                  <Input
                    id="houseNumber-ek"
                    value={documentState.houseNumber}
                    onChange={(e) =>
                      handleInputChange("houseNumber", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode-ek">PLZ</Label>
                  <Input
                    id="postalCode-ek"
                    value={documentState.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city-ek">Ort</Label>
                  <Input
                    id="city-ek"
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
