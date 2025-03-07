"use client";

import {
  OnboardingProvider,
  OnboardingStep,
  useOnboarding,
} from "./context/onboarding-context";
import { StepSidebar } from "./components/StepSidebar";
import { CompanyInfoStep } from "./steps/CompanyInfoStep";
import { ManagingDirectorsStep } from "./steps/ManagingDirectorsStep";
import { PayrollProcessingStep } from "./steps/PayrollProcessingStep";
import { WorksCouncilStep } from "./steps/WorksCouncilStep";
import { CollectiveAgreementStep } from "./steps/CollectiveAgreementStep";
import { GivveCardStep } from "./steps/GivveCardStep";
import { HeadquartersStep } from "./steps/HeadquartersStep";
import { BeneficialOwnersStep } from "./steps/BeneficialOwnersStep";
import { ReviewStep } from "./steps/ReviewStep";
import { useCompany, useSubsidiaries } from "@/context/company-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, ArrowRight, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

// Component to render the current step
const CurrentStep = () => {
  const { currentStep } = useOnboarding();

  switch (currentStep) {
    case OnboardingStep.COMPANY_INFO:
      return <CompanyInfoStep />;
    case OnboardingStep.MANAGING_DIRECTORS:
      return <ManagingDirectorsStep />;
    case OnboardingStep.PAYROLL_PROCESSING:
      return <PayrollProcessingStep />;
    case OnboardingStep.WORKS_COUNCIL:
      return <WorksCouncilStep />;
    case OnboardingStep.COLLECTIVE_AGREEMENT:
      return <CollectiveAgreementStep />;
    case OnboardingStep.GIVVE_CARD:
      return <GivveCardStep />;
    case OnboardingStep.HEADQUARTERS:
      return <HeadquartersStep />;
    case OnboardingStep.BENEFICIAL_OWNERS:
      return <BeneficialOwnersStep />;
    case OnboardingStep.REVIEW:
      return <ReviewStep />;
    default:
      return (
        <div className="rounded-lg bg-muted p-6">
          <h3 className="mb-2 text-lg font-medium">
            Schritt wird implementiert
          </h3>
          <p className="text-muted-foreground">
            Dieser Schritt wird derzeit implementiert. Bitte versuchen Sie es
            später erneut.
          </p>
        </div>
      );
  }
};

// Wrapper component that checks if a subsidiary is selected
const OnboardingWrapper = () => {
  const { subsidiary, isLoading: isCompanyLoading } = useCompany();
  const router = useRouter();

  // if onboarding is completed show success page
  if (subsidiary?.onboarding_completed) {
    return (
      <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl rounded-xl border bg-card p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>

          <h1 className="mb-4 text-center text-3xl font-bold tracking-tight">
            Onboarding für{" "}
            <span className="text-primary">{subsidiary.name}</span>{" "}
            abgeschlossen
          </h1>

          <p className="mb-8 text-center text-muted-foreground">
            Vielen Dank für Ihre Teilnahme am Onboarding. Alle erforderlichen
            Informationen wurden erfolgreich gespeichert.
          </p>

          <div className="mb-8 rounded-lg border bg-muted/30 p-4">
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

          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
            <Button
              onClick={() => router.push("/dashboard")}
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
        </div>
      </div>
    );
  }

  if (isCompanyLoading) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Daten werden geladen...</p>
      </div>
    );
  }

  if (!subsidiary) {
    return null; // Will redirect in the useEffect
  }

  return (
    <OnboardingProvider>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">
          Onboarding: {subsidiary.name}
        </h1>

        <div className="flex flex-col gap-6 md:flex-row">
          <StepSidebar />

          <div className="flex-1">
            <CurrentStep />
          </div>
        </div>
      </div>
    </OnboardingProvider>
  );
};

// Main page component
export default function OnboardingPage() {
  return <OnboardingWrapper />;
}
