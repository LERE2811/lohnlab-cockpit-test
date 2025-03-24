"use client";

import { cn } from "@/lib/utils";
import {
  useGivveOnboarding,
  GivveOnboardingStep,
} from "../context/givve-onboarding-context";
import {
  Check,
  CreditCard,
  FileText,
  FileSignature,
  Send,
  UserCheck,
  Video,
  Receipt,
  CircleDollarSign,
  CheckCircle,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define step interface
interface GivveOnboardingStepItem {
  id: GivveOnboardingStep;
  name: string;
  icon: React.ElementType;
  interactive: boolean;
}

export function StepSidebar() {
  const { currentStep, goToStep } = useGivveOnboarding();

  // Define the steps
  const steps: GivveOnboardingStepItem[] = [
    {
      id: GivveOnboardingStep.CARD_TYPE,
      name: "Auswahl Art der givve® Card",
      icon: CreditCard,
      interactive: true,
    },
    {
      id: GivveOnboardingStep.REQUIRED_DOCUMENTS,
      name: "Benötigte Unterlagen",
      icon: FileText,
      interactive: true,
    },
    {
      id: GivveOnboardingStep.ORDER_FORMS,
      name: "Bestellformular & Dokumentationsbogen",
      icon: FileText,
      interactive: true,
    },
    {
      id: GivveOnboardingStep.READY_FOR_SIGNATURE,
      name: "Bereit zur Unterschrift",
      icon: FileSignature,
      interactive: true,
    },
    {
      id: GivveOnboardingStep.SIGNED_FORMS,
      name: "Formulare unterschrieben",
      icon: Check,
      interactive: true,
    },
    {
      id: GivveOnboardingStep.DOCUMENTS_SUBMITTED,
      name: "Unterlagen bei givve eingereicht",
      icon: Send,
      interactive: false,
    },
    {
      id: GivveOnboardingStep.VIDEO_IDENTIFICATION_LINK,
      name: "Link zur Videoidentifizierung erhalten",
      icon: Video,
      interactive: false,
    },
    {
      id: GivveOnboardingStep.CARD_DESIGN_VERIFICATION,
      name: "Kartendesign zur Überprüfung",
      icon: CreditCard,
      interactive: false,
    },
    {
      id: GivveOnboardingStep.VIDEO_IDENTIFICATION_COMPLETED,
      name: "Videoidentifizierung abgeschlossen",
      icon: UserCheck,
      interactive: false,
    },
    {
      id: GivveOnboardingStep.INITIAL_INVOICE_RECEIVED,
      name: "Initiale Rechnung erhalten",
      icon: Receipt,
      interactive: false,
    },
    {
      id: GivveOnboardingStep.INITIAL_INVOICE_PAID,
      name: "Initiale Rechnung bezahlt",
      icon: CircleDollarSign,
      interactive: false,
    },
    {
      id: GivveOnboardingStep.COMPLETED,
      name: "givve Onboarding beendet",
      icon: CheckCircle,
      interactive: false,
    },
  ];

  // Check if a step should be interactive based on current progression
  const isStepAvailable = (step: GivveOnboardingStepItem): boolean => {
    // First step is always available
    if (step.id === GivveOnboardingStep.CARD_TYPE) return true;

    // Current and completed steps are available
    if (currentStep === step.id || currentStep > step.id) return true;

    // For other steps, they're available if they are marked as interactive
    // and the previous step is completed
    if (step.interactive) {
      const previousStepIndex = steps.findIndex((s) => s.id === step.id) - 1;
      if (previousStepIndex >= 0) {
        return currentStep > steps[previousStepIndex].id;
      }
    }

    return false;
  };

  return (
    <div className="w-64 rounded-lg bg-muted p-4">
      <h3 className="mb-4 font-medium">givve® Onboarding Schritte</h3>
      <div className="space-y-1">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isAvailable = isStepAvailable(step);
          const canClick =
            (isAvailable && step.interactive) || isActive || isCompleted;

          const StepButton = () => (
            <button
              className={cn(
                "flex w-full items-center justify-between rounded-md p-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isCompleted
                    ? "text-foreground hover:bg-muted-foreground/10"
                    : isAvailable && step.interactive
                      ? "text-foreground hover:bg-muted-foreground/10"
                      : "cursor-not-allowed text-muted-foreground/40",
              )}
              onClick={() => canClick && goToStep(step.id)}
              disabled={!canClick}
              aria-disabled={!canClick}
            >
              <div className="flex items-center space-x-3">
                {isCompleted ? (
                  <Check
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary-foreground" : "text-foreground",
                    )}
                  />
                ) : (
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive
                        ? "text-primary-foreground"
                        : isAvailable && step.interactive
                          ? "text-foreground"
                          : "text-muted-foreground/40",
                    )}
                  />
                )}
                <span className="text-left">{step.name}</span>
              </div>

              {/* Show lock icon for unavailable steps */}
              {!isAvailable && !isActive && !isCompleted && (
                <Lock className="h-4 w-4 text-muted-foreground/40" />
              )}
            </button>
          );

          if (!isAvailable && !isCompleted && !isActive) {
            // Show tooltip for unavailable steps
            const tooltipMessage = step.interactive
              ? "Bitte schließen Sie zuerst die vorherigen Schritte ab"
              : "Dieser Schritt wird automatisch aktualisiert";

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
}
