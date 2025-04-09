"use client";

import { StepLayout } from "../components/StepLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGivveOnboarding } from "../context/givve-onboarding-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface StatusStep {
  title: string;
  completed: boolean;
}

export const CompletedStep = () => {
  const { completeOnboarding, progress } = useGivveOnboarding();
  const router = useRouter();

  const statusSteps: StatusStep[] = [
    {
      title: "Unterlagen bei givve® eingereicht",
      completed: true, // Always true as we're on the completed step
    },
    {
      title: "Link zur Videoidentifizierung erhalten",
      completed: !!progress?.video_identification_link,
    },
    {
      title: "Videoidentifizierung abgeschlossen",
      completed: !!progress?.video_identification_completed,
    },
    {
      title: "Initiale Rechnung erhalten",
      completed: !!progress?.initial_invoice_received,
    },
    {
      title: "Initiale Rechnung bezahlt",
      completed: !!progress?.initial_invoice_paid,
    },
  ];

  const handleComplete = async () => {
    await completeOnboarding();
  };

  return (
    <StepLayout
      title="Onboarding Status"
      description="Ihre Unterlagen wurden erfolgreich bei givve® eingereicht. Hier können Sie den aktuellen Status einsehen."
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
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Aktueller Bearbeitungsstatus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="relative">
                {statusSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="relative">
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border-2",
                          step.completed
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground bg-background",
                        )}
                      >
                        {step.completed && <CheckCircle className="h-4 w-4" />}
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-1/2 top-6 h-full w-0.5 -translate-x-1/2",
                            step.completed
                              ? "bg-primary"
                              : "bg-muted-foreground/30",
                          )}
                        />
                      )}
                    </div>
                    <div className="pb-8">
                      <p
                        className={cn(
                          "font-medium",
                          step.completed
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p>
                  Die Bearbeitung Ihrer Unterlagen erfolgt schrittweise. Sie
                  werden per E-Mail über jeden abgeschlossenen Schritt
                  informiert.
                </p>
                <p className="mt-2">
                  Nach erfolgreicher Videoidentifizierung und Bezahlung der
                  initialen Rechnung werden Ihre givve® Cards produziert und an
                  die angegebene Adresse versendet.
                </p>
                <p className="mt-2">
                  Bei Fragen können Sie sich jederzeit an unseren Support
                  wenden.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepLayout>
  );
};
