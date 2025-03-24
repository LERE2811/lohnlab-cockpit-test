"use client";

import { StepLayout } from "../components/StepLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileSignature, FileWarning, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGivveOnboarding } from "../context/givve-onboarding-context";

export const ReadyForSignatureStep = () => {
  const { saveProgress } = useGivveOnboarding();

  const handleContinue = async () => {
    await saveProgress({});
  };

  return (
    <StepLayout
      title="Bereit zur Unterschrift"
      description="Ihre Dokumente sind bereit zur Unterschrift"
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
              <FileSignature className="mr-2 h-5 w-5 text-primary" />
              Dokumente zur Unterschrift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed text-foreground">
              <p className="mb-4">
                Ihre Bestellformulare und Dokumentationsbögen sind bereit zur
                Unterschrift. Bitte überprüfen Sie alle Dokumente sorgfältig,
                bevor Sie sie unterschreiben.
              </p>
              <p>
                Nach der Unterschrift werden die Dokumente an givve®
                weitergeleitet, um den Bestellprozess für Ihre Karten zu
                starten.
              </p>
            </CardDescription>
          </CardContent>
          <CardFooter className="flex gap-4 pt-2">
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Bestellformular herunterladen
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Dokumentationsbogen herunterladen
            </Button>
          </CardFooter>
        </Card>
      </div>
    </StepLayout>
  );
};
