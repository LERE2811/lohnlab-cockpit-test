"use client";

import { useRouter } from "next/navigation";
import { useCompany } from "@/context/company-context";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const { subsidiary } = useCompany();

  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-2xl rounded-xl border bg-card p-8 shadow-lg">
      <CardContent className="flex flex-col items-center justify-center p-0">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        <h1 className="mb-4 text-center text-3xl font-bold tracking-tight">
          Onboarding abgeschlossen!
        </h1>

        <p className="mb-8 max-w-md text-center text-muted-foreground">
          Vielen Dank für das Ausfüllen aller erforderlichen Informationen. Ihre
          Gesellschaft <span className="font-semibold">{subsidiary?.name}</span>{" "}
          wurde erfolgreich eingerichtet und ist jetzt einsatzbereit.
        </p>

        <div className="mb-8 w-full max-w-md rounded-lg border bg-muted/30 p-4 text-left">
          <h3 className="mb-2 font-semibold">Nächste Schritte:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <ArrowRight className="mr-2 h-4 w-4 text-primary" />
              <span>
                Überprüfen Sie, ob noch weitere Tochterunternehmen das
                Onboarding benötigen
              </span>
            </li>
            <li className="flex items-start">
              <ArrowRight className="mr-2 h-4 w-4 text-primary" />
              <span>
                Erkunden Sie Ihr Dashboard, um einen Überblick über Ihre
                Gesellschaft zu erhalten
              </span>
            </li>
            <li className="flex items-start">
              <ArrowRight className="mr-2 h-4 w-4 text-primary" />
              <span>
                Bei Fragen oder Problemen steht Ihnen unser Support-Team zur
                Verfügung
              </span>
            </li>
          </ul>
        </div>

        <div className="flex w-full flex-col space-y-3 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
          <Button
            onClick={navigateToDashboard}
            className="min-w-[200px]"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Zum Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/settings")}
            className="min-w-[200px]"
            size="lg"
          >
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </Button>
        </div>

        <div className="mt-8 w-full rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
          <p>
            Bei Fragen oder Problemen kontaktieren Sie bitte unseren Support
            unter{" "}
            <a
              href="mailto:support@lohnlab.de"
              className="font-medium text-primary underline underline-offset-4"
            >
              support@lohnlab.de
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
