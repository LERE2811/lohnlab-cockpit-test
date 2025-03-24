"use client";

import { StepLayout } from "../components/StepLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, FileWarning } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGivveOnboarding } from "../context/givve-onboarding-context";

export const RequiredDocumentsStep = () => {
  const { saveProgress } = useGivveOnboarding();

  const handleContinue = async () => {
    await saveProgress({ requiresAdditionalDocuments: true });
  };

  return (
    <StepLayout
      title="Benötigte Unterlagen"
      description="Informationen zu den benötigten Unterlagen gemäß Geldwäschegesetz"
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
              <Shield className="mr-2 h-5 w-5 text-primary" />
              Information zum Geldwäschegesetz (GwG)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed text-foreground">
              <p className="mb-4">
                Entsprechend den Sorgfaltspflichten nach dem Geldwäschegesetz
                (GwG) benötigen wir Unterlagen zur Identifizierung der
                wirtschaftlich Berechtigten. Diese Informationen sind gesetzlich
                vorgeschrieben und dienen der Prävention von Geldwäsche und
                Terrorismusfinanzierung.
              </p>
              <p className="mb-4">
                Nach Abschluss dieses Schritts werden wir Sie kontaktieren, um
                die erforderlichen Unterlagen anzufordern. Bitte halten Sie
                folgende Dokumente bereit:
              </p>
              <ul className="list-inside list-disc space-y-2">
                <li>Handelsregisterauszug (nicht älter als 3 Monate)</li>
                <li>Identitätsnachweise der wirtschaftlich Berechtigten</li>
                <li>Transparenzregisterauszug (falls zutreffend)</li>
              </ul>
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </StepLayout>
  );
};
