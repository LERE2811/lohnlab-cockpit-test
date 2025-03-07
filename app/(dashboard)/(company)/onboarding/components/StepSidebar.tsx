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
  CheckCircle,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the step type
interface OnboardingStepItem {
  id: OnboardingStep;
  title: string;
  icon: React.ElementType;
  requiredFields: string[];
}

export const StepSidebar = () => {
  const { currentStep, goToStep, isLoading, formData } = useOnboarding();

  const steps: OnboardingStepItem[] = [
    {
      id: OnboardingStep.COMPANY_INFO,
      title: "Unternehmen",
      icon: Building2,
      requiredFields: [
        "tax_number",
        "street",
        "house_number",
        "postal_code",
        "city",
      ],
    },
    {
      id: OnboardingStep.MANAGING_DIRECTORS,
      title: "Geschäftsführer",
      icon: Users,
      requiredFields: ["managing_directors"],
    },
    {
      id: OnboardingStep.PAYROLL_PROCESSING,
      title: "Lohnabrechnung",
      icon: FileSpreadsheet,
      requiredFields: ["payroll_processing"],
    },
    {
      id: OnboardingStep.WORKS_COUNCIL,
      title: "Betriebsrat",
      icon: Users2,
      requiredFields: ["has_works_council"],
    },
    {
      id: OnboardingStep.COLLECTIVE_AGREEMENT,
      title: "Tarifbindung",
      icon: FileCheck,
      requiredFields: ["has_collective_agreement"],
    },
    {
      id: OnboardingStep.GIVVE_CARD,
      title: "Givve Card",
      icon: CreditCard,
      requiredFields: ["has_givve_card"],
    },
    {
      id: OnboardingStep.HEADQUARTERS,
      title: "Hauptniederlassung",
      icon: Home,
      requiredFields: [
        "headquarters_street",
        "headquarters_postal_code",
        "headquarters_city",
      ],
    },
    {
      id: OnboardingStep.BENEFICIAL_OWNERS,
      title: "Wirtschaftlich Berechtigte",
      icon: UserCheck,
      requiredFields: ["beneficial_owners"],
    },
    {
      id: OnboardingStep.REVIEW,
      title: "Überprüfung & Abschluss",
      icon: ClipboardCheck,
      requiredFields: [],
    },
  ];

  // Check if a step is completed based on required fields
  const isStepCompleted = (step: OnboardingStepItem): boolean => {
    if (!formData) return false;

    // If we're past this step, consider it completed
    if (currentStep > step.id) return true;

    // Check if all required fields are filled
    return step.requiredFields.every((field: string) => {
      // For array fields, check if they exist and have at least one item
      if (
        field === "managing_directors" ||
        field === "beneficial_owners" ||
        field === "payroll_contacts"
      ) {
        return formData[field] && formData[field].length > 0;
      }

      // For boolean fields, they just need to exist (can be true or false)
      if (
        field === "has_works_council" ||
        field === "has_collective_agreement" ||
        field === "has_givve_card"
      ) {
        return formData[field] !== undefined;
      }

      // For other fields, check if they exist and are not empty
      return (
        formData[field] && formData[field].trim && formData[field].trim() !== ""
      );
    });
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
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isPrevious = currentStep > step.id;
          const isCompleted = isStepCompleted(step);
          const isAvailable = index === 0 || isStepCompleted(steps[index - 1]);
          const canClick =
            isActive ||
            isPrevious ||
            (index > 0 && isStepCompleted(steps[index - 1]));

          const StepButton = () => (
            <button
              className={cn(
                "flex w-full items-center justify-between rounded-md p-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isPrevious && isCompleted
                    ? "text-muted-foreground hover:bg-muted-foreground/10"
                    : isAvailable
                      ? "text-muted-foreground hover:bg-muted-foreground/10"
                      : "cursor-not-allowed text-muted-foreground/40",
              )}
              onClick={() => canClick && goToStep(step.id)}
              disabled={!canClick}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive
                      ? "text-primary-foreground"
                      : isPrevious && isCompleted
                        ? "text-muted-foreground"
                        : isAvailable
                          ? "text-muted-foreground"
                          : "text-muted-foreground/40",
                  )}
                />
                <span>{step.title}</span>
              </div>

              {/* Show lock icon for unavailable steps */}
              {!isAvailable && !isActive && (
                <Lock className="h-4 w-4 text-muted-foreground/40" />
              )}

              {/* Show checkmark only for completed steps that are available and not active */}
              {isCompleted && !isActive && isAvailable && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </button>
          );

          if (!isAvailable) {
            return (
              <TooltipProvider key={step.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <StepButton />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bitte schließen Sie zuerst den vorherigen Schritt ab</p>
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
