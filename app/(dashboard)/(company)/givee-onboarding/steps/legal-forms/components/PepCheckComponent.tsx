"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Info, AlertTriangle } from "lucide-react";

interface PepCheckComponentProps {
  documentState: any;
  setDocumentState: (state: any) => void;
  className?: string;
}

export function PepCheckComponent({
  documentState,
  setDocumentState,
  className = "",
}: PepCheckComponentProps) {
  console.log("PepCheckComponent rendering with documentState:", documentState);

  // Initialize state based on documentState.hasPep explicitly boolean conversion
  const [showPepDetails, setShowPepDetails] = useState<boolean>(
    Boolean(documentState.hasPep),
  );

  // Update showPepDetails whenever documentState changes
  useEffect(() => {
    console.log(
      "PepCheckComponent documentState changed, hasPep:",
      documentState.hasPep,
    );
    setShowPepDetails(Boolean(documentState.hasPep));
  }, [documentState.hasPep]);

  const handlePepChange = (hasPep: boolean) => {
    console.log("handlePepChange called with:", hasPep);
    setShowPepDetails(hasPep);
    setDocumentState({
      ...documentState,
      hasPep: hasPep, // Ensure we're setting a boolean value
      pepDetails: hasPep ? documentState.pepDetails || "" : "",
    });
  };

  const handlePepDetailsChange = (details: string) => {
    console.log("handlePepDetailsChange called with:", details);
    setDocumentState({
      ...documentState,
      pepDetails: details,
    });
  };

  // Explicitly determine the radio value
  const radioValue =
    documentState.hasPep === true
      ? "yes"
      : documentState.hasPep === false
        ? "no"
        : "";

  console.log(
    "PepCheckComponent radioValue:",
    radioValue,
    "showPepDetails:",
    showPepDetails,
  );

  return (
    <div className={`rounded-lg border bg-gray-50 p-5 ${className}`}>
      <h4 className="mb-3 border-b pb-2 text-lg font-medium">
        Prüfung gemäß Geldwäschegesetz (GwG)
      </h4>

      <div className="mb-4 space-y-2 rounded border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <p className="text-sm text-blue-700">
              <strong>Information:</strong> Nach dem Geldwäschegesetz müssen wir
              feststellen, ob eine politisch exponierte Person (PEP) oder deren
              Familienmitglied oder eine bekanntermaßen nahestehende Person in
              Ihrem Unternehmen beteiligt ist.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Eine politisch exponierte Person (PEP) ist eine Person, die ein
          hochrangiges öffentliches Amt auf internationaler, europäischer oder
          nationaler Ebene ausübt oder ausgeübt hat oder ein öffentliches Amt
          unterhalb der nationalen Ebene, dessen politische Bedeutung
          vergleichbar ist.
        </p>

        <div className="mt-4">
          <Label className="text-md font-medium">
            Gibt es bei Ihrem Unternehmen einen Bezug zu einer politisch
            exponierten Person?
          </Label>

          <RadioGroup
            value={radioValue}
            onValueChange={(value) => handlePepChange(value === "yes")}
            className="mt-2"
          >
            <div className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100">
              <RadioGroupItem value="yes" id="pep-yes" />
              <Label htmlFor="pep-yes" className="text-sm">
                Ja, in unserem Unternehmen ist eine PEP, ein Familienmitglied
                einer PEP oder eine bekanntermaßen einer PEP nahestehende Person
                beteiligt.
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100">
              <RadioGroupItem value="no" id="pep-no" />
              <Label htmlFor="pep-no" className="text-sm">
                Nein, es gibt keine Verbindung zu politisch exponierten
                Personen.
              </Label>
            </div>
          </RadioGroup>
        </div>

        {showPepDetails && (
          <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-4">
            <div className="mb-3 flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                Bitte geben Sie weitere Informationen zu der politisch
                exponierten Person an.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="pep-details" className="text-sm font-medium">
                  Details zur politisch exponierten Person
                </Label>
                <Textarea
                  id="pep-details"
                  placeholder="Bitte nennen Sie Name, Position/Funktion und Beziehung zur politisch exponierten Person"
                  value={documentState.pepDetails || ""}
                  onChange={(e) => handlePepDetailsChange(e.target.value)}
                  className="mt-1 bg-white"
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
