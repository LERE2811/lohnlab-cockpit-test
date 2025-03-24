"use client";

import { useRouter } from "next/navigation";
import { useCompany } from "@/context/company-context";
import { Button } from "@/components/ui/button";
import { ClipboardList, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { OnboardingStep } from "@/app/(dashboard)/(company)/onboarding/context/onboarding-context";

export const OnboardingBanner = () => {
  const { subsidiary } = useCompany();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  // Don't show the banner if there's no subsidiary or if onboarding is completed or if dismissed
  if (!subsidiary || subsidiary.onboarding_completed || dismissed) {
    return null;
  }

  // Map the current step number to the corresponding OnboardingStep enum
  const currentStep = subsidiary.onboarding_step || 1;

  // Total number of steps based on the OnboardingStep enum (7 steps total)
  const totalSteps = 7; // GESELLSCHAFT, STANDORTE, LOHNABRECHNUNG, BUCHHALTUNG, ANSPRECHPARTNER, GIVVE_CARD, REVIEW

  // Calculate progress percentage based on the current step
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  // Get a description of the current step
  const getStepDescription = (step: number) => {
    switch (step) {
      case OnboardingStep.GESELLSCHAFT:
        return "Gesellschaft";
      case OnboardingStep.STANDORTE:
        return "Standorte";
      case OnboardingStep.LOHNABRECHNUNG:
        return "Lohnabrechnung";
      case OnboardingStep.BUCHHALTUNG:
        return "Buchhaltung";
      case OnboardingStep.ANSPRECHPARTNER:
        return "Ansprechpartner";
      case OnboardingStep.GIVVE_CARD:
        return "givve Card";
      case OnboardingStep.REVIEW:
        return "Überprüfung & Abschluss";
      default:
        return "Onboarding";
    }
  };

  return (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-blue-50 px-4 py-4 shadow-sm dark:border-blue-800 dark:bg-blue-950/30">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 rounded-full p-0 text-blue-500 opacity-70 hover:bg-blue-100 hover:opacity-100 dark:text-blue-300 dark:hover:bg-blue-900/50"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>

        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
            <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>

          <div className="flex-1">
            <h5 className="mb-1 text-base font-medium text-blue-800 dark:text-blue-200">
              Onboarding für {subsidiary.name} nicht abgeschlossen
            </h5>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Sie haben das Onboarding für {subsidiary.name} begonnen, aber noch
              nicht abgeschlossen. Aktueller Schritt:{" "}
              {getStepDescription(currentStep)} ({progressPercentage}%)
            </p>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-blue-400"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500 bg-white text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900/50"
              onClick={() => router.push(`/onboarding`)}
            >
              Onboarding fortsetzen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
