"use client";

import { useEffect, useState } from "react";
import { useCompany } from "@/context/company-context";
import { supabase } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  PartyPopper,
  Calendar,
  ArrowRight,
  CreditCard,
  Wallet,
  Mail,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Onboarding-Prozess für die givve Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">Einreichung der Unterlagen</p>
                  <p className="text-sm text-muted-foreground">
                    Der Kunde reicht die erforderlichen Unterlagen bei givve
                    ein. Diese werden auf Vollständigkeit geprüft und mit dem
                    Transparenzregister abgeglichen.
                  </p>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Step 2.1 */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      progress.video_identification_link
                        ? "bg-primary text-primary-foreground"
                        : "border-2 border-muted-foreground bg-background",
                    )}
                  >
                    <Eye className="h-4 w-4" />
                  </div>
                  <div className="absolute right-4 top-0 flex h-5 w-5 items-center justify-center rounded-full border border-muted bg-muted text-[10px] font-medium">
                    +3
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">Videoidentifizierung</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>3 Werktage später:</strong> Der
                    vertretungsberechtigte Ansprechpartner erhält per E-Mail von
                    office@givve.com einen Link zur Durchführung der
                    Videoidentifizierung.
                  </p>
                </div>
              </div>

              {/* Step 2.2 */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground bg-background">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="absolute right-4 top-0 flex h-5 w-5 items-center justify-center rounded-full border border-muted bg-muted text-[10px] font-medium">
                    +5
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">Freigabe des Kartendesigns</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>
                      Parallel dazu, aber 5 Werktage nach Einreichung:
                    </strong>{" "}
                    Der Kunde erhält eine E-Mail mit einer Vorschau des finalen
                    Designs der givve Card. Diese Designvorschau muss vom Kunden
                    freigegeben werden.
                  </p>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      progress.initial_invoice_received
                        ? "bg-primary text-primary-foreground"
                        : "border-2 border-muted-foreground bg-background",
                    )}
                  >
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="absolute right-4 top-0 flex h-5 w-5 items-center justify-center rounded-full border border-muted bg-muted text-[10px] font-medium">
                    +1
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">
                    Erstellung der initialen Rechnung
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>
                      1 Werktag nach erfolgreicher Videoidentifizierung:
                    </strong>{" "}
                    Die Buchhaltungs-E-Mail-Adresse des Kunden erhält eine erste
                    Rechnung, die sowohl die Onboarding-Kosten als auch die
                    Produktionskosten für die erste Kartenbestellung (eine
                    Testkarte für den Ansprechpartner) umfasst.
                  </p>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      progress.initial_invoice_paid
                        ? "bg-primary text-primary-foreground"
                        : "border-2 border-muted-foreground bg-background",
                    )}
                  >
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="absolute right-4 top-0 flex h-5 w-5 items-center justify-center rounded-full border border-muted bg-muted text-[10px] font-medium">
                    +1
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">Abschluss des Onboardings</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>1 Werktag nach Zahlung der Rechnung:</strong> Sobald
                    die Rechnung bezahlt wurde, wird der Kunde freigeschaltet.
                    Ab diesem Zeitpunkt können echte Kartenbestellungen oder
                    Ladeaufträge durchgeführt werden.
                  </p>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Step 5 */}
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground bg-background">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">Kartenproduktion und -lieferung</p>
                  <p className="text-sm text-muted-foreground">
                    Mit Rechnungseingang geht die Karte in Produktion und kann
                    sofort geladen werden. Nach ca. 10-14 Tagen trifft die Karte
                    beim Arbeitgeber mit der Post (1 Karte) oder UPS (mehr als
                    eine Karte) ein.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
