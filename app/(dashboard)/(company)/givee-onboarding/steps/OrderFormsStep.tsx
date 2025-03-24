"use client";

import { StepLayout } from "../components/StepLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, FileWarning } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGivveOnboarding } from "../context/givve-onboarding-context";

export const OrderFormsStep = () => {
  const { saveProgress } = useGivveOnboarding();

  const handleContinue = async () => {
    await saveProgress({});
  };

  return (
    <StepLayout
      title="Bestellformular und Dokumentationsbogen"
      description="Ihre Bestellformulare werden vorbereitet"
      onSave={handleContinue}
    >
      <div className="space-y-6">
        <Alert
          variant="default"
          className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
        >
          <FileWarning className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Dies ist ein Platzhalter. Die vollständige Funktionalität folgt in
            weiteren Updates.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Bestellformular und Dokumentationsbogen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed text-foreground">
              <p className="mb-4">
                Basierend auf Ihren Angaben werden wir ein Bestellformular und
                einen Dokumentationsbogen für Ihr Unternehmen vorbereiten.
              </p>
              <p className="mb-4">Diese Dokumente enthalten:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Bestelldaten für Ihre givve® Card</li>
                <li>Angaben zum ausgewählten Kartentyp und Design</li>
                <li>Preise und Gebühren</li>
                <li>Dokumentationsbogen gemäß Geldwäschegesetz</li>
              </ul>
              <p className="mt-4">
                Im nächsten Schritt werden diese Dokumente zur Unterschrift
                bereitgestellt.
              </p>
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </StepLayout>
  );
};
