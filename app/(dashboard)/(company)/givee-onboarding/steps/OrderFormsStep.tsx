"use client";

import { StepLayout } from "../components/StepLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileSymlink, FileWarning, FileCheck } from "lucide-react";
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
import { useState } from "react";

export const OrderFormsStep = () => {
  const { saveProgress } = useGivveOnboarding();
  const [formDownloaded, setFormDownloaded] = useState(false);

  const handleDownloadForm = () => {
    // In a real implementation, this would download the forms
    // For now, just set the state to indicate the form was downloaded
    setFormDownloaded(true);
  };

  const handleContinue = async () => {
    // Save progress and move to the next step
    await saveProgress({ documentsSubmitted: true });
  };

  return (
    <StepLayout
      title="Bestellformular & Dokumentationsbogen"
      description="Herunterladen und Ausfüllen der benötigten Formulare"
      onSave={handleContinue}
      disableNext={!formDownloaded}
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
              <FileSymlink className="mr-2 h-5 w-5 text-primary" />
              Bestellformular für givve® Card
            </CardTitle>
            <CardDescription>
              Bitte laden Sie das Bestellformular herunter und füllen Sie es
              vollständig aus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Das Bestellformular enthält alle notwendigen Informationen zur
              Bestellung Ihrer givve® Cards. Bitte stellen Sie sicher, dass
              alle erforderlichen Felder ausgefüllt sind.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleDownloadForm}>
              <FileCheck className="mr-2 h-4 w-4" />
              {formDownloaded
                ? "Formular erneut herunterladen"
                : "Formular herunterladen"}
            </Button>
          </CardFooter>
        </Card>

        {formDownloaded && (
          <Alert
            variant="default"
            className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200"
          >
            <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Formular erfolgreich heruntergeladen. Bitte füllen Sie es aus und
              fahren Sie mit dem nächsten Schritt fort.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </StepLayout>
  );
};
