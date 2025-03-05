"use client";

import { useRouter } from "next/navigation";
import { useCompany } from "@/context/company-context";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function CompletedStep() {
  const router = useRouter();
  const { company } = useCompany();

  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-6 rounded-full bg-green-100 p-3">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>

      <h2 className="mb-2 text-2xl font-bold">Onboarding abgeschlossen!</h2>

      <p className="mb-6 max-w-md text-muted-foreground">
        Vielen Dank für das Ausfüllen aller erforderlichen Informationen. Ihr
        Unternehmen {company?.name} wurde erfolgreich eingerichtet.
      </p>

      <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
        <Button onClick={navigateToDashboard} className="min-w-[200px]">
          Zum Dashboard
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push("/profile")}
          className="min-w-[200px]"
        >
          Profil bearbeiten
        </Button>
      </div>

      <div className="mt-8 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
        <p>
          Bei Fragen oder Problemen kontaktieren Sie bitte unseren Support unter{" "}
          <a
            href="mailto:support@lohnlab.de"
            className="font-medium text-primary underline underline-offset-4"
          >
            support@lohnlab.de
          </a>
        </p>
      </div>
    </div>
  );
}
