"use client";

import { useOnboarding, OnboardingStep } from "../context/onboarding-context";
import { cn } from "@/lib/utils";
import {
  Building2,
  Users,
  FileSpreadsheet,
  Users2,
  FileCheck,
  CreditCard,
  Home,
  UserCheck,
  ClipboardCheck,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

// Define the step type
interface OnboardingStepItem {
  id: OnboardingStep;
  title: string;
  icon: React.ElementType;
}

export const StepSidebar = () => {
  const {
    currentStep,
    goToStep,
    isLoading,
    isStepCompleted,
    areAllStepsCompleted,
    formData,
  } = useOnboarding();

  // State to force re-render when necessary
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Force refresh when formData changes, especially for the GIVVE_CARD step
  useEffect(() => {
    // Skip during initial render or when formData is not yet loaded
    if (!formData) return;

    // Check specifically if has_givve_card has been set (can be true or false)
    const hasGivveCardIsDefined = formData.has_givve_card !== undefined;

    if (hasGivveCardIsDefined) {
      // Force a re-check of all steps completion
      const allStepsCompleted = areAllStepsCompleted();

      // Check if review step should be available
      const isReviewStepAvailable = isStepCompleted(OnboardingStep.REVIEW);

      // Force re-render
      setRefreshCounter((prev) => prev + 1);

      // Force another update after a short delay to ensure all context updates have propagated
      setTimeout(() => {
        const allStepsCompleted = areAllStepsCompleted();
        setRefreshCounter((prev) => prev + 1);
      }, 300);
    }
  }, [formData, areAllStepsCompleted, isStepCompleted]);

  const steps: OnboardingStepItem[] = [
    {
      id: OnboardingStep.GESELLSCHAFT,
      title: "Gesellschaft",
      icon: Building2,
    },
    {
      id: OnboardingStep.STANDORTE,
      title: "Standorte",
      icon: Home,
    },
    {
      id: OnboardingStep.LOHNABRECHNUNG,
      title: "Lohnabrechnung",
      icon: FileSpreadsheet,
    },
    {
      id: OnboardingStep.BUCHHALTUNG,
      title: "Buchhaltung",
      icon: FileCheck,
    },
    {
      id: OnboardingStep.ANSPRECHPARTNER,
      title: "Ansprechpartner",
      icon: Users,
    },
    {
      id: OnboardingStep.GIVVE_CARD,
      title: "givve® Card",
      icon: CreditCard,
    },
    {
      id: OnboardingStep.REVIEW,
      title: "Überprüfung & Abschluss",
      icon: ClipboardCheck,
    },
  ];

  // Check if a step is available to be clicked
  const isStepAvailable = (step: OnboardingStepItem): boolean => {
    // First step is always available
    if (step.id === OnboardingStep.GESELLSCHAFT) return true;

    // Current step is always available
    if (currentStep === step.id) return true;

    // Completed steps are always available
    const stepCompleted = isStepCompleted(step.id);
    if (stepCompleted) return true;

    // Special case for Review step - only available when all other steps are completed
    if (step.id === OnboardingStep.REVIEW) {
      const allCompleted = areAllStepsCompleted();
      return allCompleted;
    }

    // For other steps, they're available if the previous step is completed
    const previousStepIndex = steps.findIndex((s) => s.id === step.id) - 1;
    if (previousStepIndex >= 0) {
      const prevStepCompleted = isStepCompleted(steps[previousStepIndex].id);
      return prevStepCompleted;
    }

    return false;
  };

  if (isLoading) {
    return (
      <div className="w-64 rounded-lg bg-muted p-4">
        <div className="space-y-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted-foreground/20" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 rounded-lg bg-muted p-4">
      <h3 className="mb-4 font-medium">Onboarding Schritte</h3>
      <div className="space-y-1">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = isStepCompleted(step.id);
          const isAvailable = isStepAvailable(step);

          // Special case for Review step
          const isReviewStep = step.id === OnboardingStep.REVIEW;
          const allCompleted = areAllStepsCompleted();
          const canClickReview = isReviewStep && allCompleted;

          // Determine if the step can be clicked - Review step should ONLY be clickable if ALL steps are completed
          const canClick =
            isActive ||
            isCompleted ||
            (isReviewStep ? canClickReview : isAvailable);

          // Create button with disabled state for Review step
          const StepButton = () => (
            <button
              className={cn(
                "flex w-full items-center justify-between rounded-md p-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isCompleted
                    ? "text-foreground hover:bg-muted-foreground/10"
                    : isAvailable
                      ? "text-foreground hover:bg-muted-foreground/10"
                      : "cursor-not-allowed text-muted-foreground/40",
              )}
              onClick={() => canClick && goToStep(step.id)}
              disabled={!canClick}
              aria-disabled={!canClick}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive
                      ? "text-primary-foreground"
                      : isCompleted
                        ? "text-foreground"
                        : isAvailable
                          ? "text-foreground"
                          : "text-muted-foreground/40",
                  )}
                />
                <span>{step.title}</span>
              </div>

              {/* Show lock icon for unavailable steps */}
              {!isAvailable && !isActive && (
                <Lock className="h-4 w-4 text-muted-foreground/40" />
              )}
            </button>
          );

          if (!isAvailable && !isCompleted) {
            // Show tooltip for unavailable steps
            const tooltipMessage = isReviewStep
              ? "Bitte schließen Sie zuerst alle vorherigen Schritte ab"
              : "Bitte schließen Sie zuerst die vorherigen Schritte ab";

            return (
              <TooltipProvider key={step.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <StepButton />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tooltipMessage}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return (
            <div key={step.id}>
              <StepButton />
            </div>
          );
        })}
      </div>
    </div>
  );
};
