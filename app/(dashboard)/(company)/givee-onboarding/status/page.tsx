"use client";

import { useEffect, useState } from "react";
import { useCompany } from "@/context/company-context";
import { supabase } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface StatusStep {
  title: string;
  completed: boolean;
}

interface OnboardingProgress {
  video_identification_link?: string;
  video_identification_completed?: boolean;
  initial_invoice_received?: boolean;
  initial_invoice_paid?: boolean;
  status?: string;
  completed?: boolean;
}

export default function GivveOnboardingStatusPage() {
  const { subsidiary, isLoading: isCompanyLoading } = useCompany();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProgress = async () => {
      if (!subsidiary) return;

      try {
        const { data: progressData, error } = await supabase
          .from("givve_onboarding_progress")
          .select("*")
          .eq("subsidiary_id", subsidiary.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching givve onboarding progress:", error);
          return;
        }

        if (!progressData?.completed) {
          router.push("/givee-onboarding");
          return;
        }

        setProgress({
          video_identification_link: progressData.video_identification_link,
          video_identification_completed:
            progressData.video_identification_completed,
          initial_invoice_received: progressData.initial_invoice_received,
          initial_invoice_paid: progressData.initial_invoice_paid,
          status: progressData.status,
          completed: progressData.completed,
        });
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (subsidiary) {
      loadProgress();
    }
  }, [subsidiary, router]);

  if (isCompanyLoading || isLoading) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!subsidiary || !progress) {
    return null;
  }

  const statusSteps: StatusStep[] = [
    {
      title: "Unterlagen bei givve® eingereicht",
      completed: true, // Always true as we're on the status page
    },
    {
      title: "Link zur Videoidentifizierung erhalten",
      completed: !!progress.video_identification_link,
    },
    {
      title: "Videoidentifizierung abgeschlossen",
      completed: !!progress.video_identification_completed,
    },
    {
      title: "Initiale Rechnung erhalten",
      completed: !!progress.initial_invoice_received,
    },
    {
      title: "Initiale Rechnung bezahlt",
      completed: !!progress.initial_invoice_paid,
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">
        givve® Card Status: {subsidiary.name}
      </h1>

      <div className="space-y-6">
        <div className="my-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
            <PartyPopper className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {progress.status && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Aktueller Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{progress.status}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Bearbeitungsstatus
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
