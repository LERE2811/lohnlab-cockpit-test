"use client";

import { StepLayout } from "../components/StepLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGivveOnboarding } from "../context/givve-onboarding-context";
import { useRouter } from "next/navigation";

export const CompletedStep = () => {
  const { completeOnboarding } = useGivveOnboarding();
  const router = useRouter();

  const handleComplete = async () => {
    await completeOnboarding();
  };

  return (
    <StepLayout
      title="givve Onboarding beendet"
      description="Herzlichen Glückwunsch! Ihr givve® Card Onboarding ist abgeschlossen."
      disablePrev={true}
      disableNext={true}
      customActions={
        <Button variant="default" size="sm" onClick={handleComplete}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Onboarding abschließen
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="my-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
            <PartyPopper className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="mr-2 h-5 w-5 text-primary" />
              Ihre givve® Cards sind bereit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p>
                Herzlichen Glückwunsch! Ihre givve® Cards wurden erfolgreich
                bestellt und an Ihre Adresse versendet. Sie sollten die Karten
                in den nächsten Tagen erhalten.
              </p>
              <p>
                Bei Fragen zur Nutzung oder Aufladen der Karten steht Ihnen
                unser Support-Team jederzeit zur Verfügung.
              </p>
              <p>
                Wir wünschen Ihnen viel Freude mit Ihren neuen givve® Cards!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepLayout>
  );
};
