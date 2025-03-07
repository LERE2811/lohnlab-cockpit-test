"use client";

import { useOnboarding, OnboardingStep } from "../context/onboarding-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface StepNavigationProps {
  onSave?: () => Promise<void>;
  onComplete?: () => Promise<void>;
  disableNext?: boolean;
}

export const StepNavigation = ({
  onSave,
  onComplete,
  disableNext = false,
}: StepNavigationProps) => {
  const {
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    saveProgress,
    completeOnboarding,
    isSaving,
    formData,
  } = useOnboarding();

  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const totalSteps = Object.keys(OnboardingStep).length / 2; // Divide by 2 because enum has both string and number keys
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    } else {
      await saveProgress(formData, true);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      if (onComplete) {
        await onComplete();
      } else {
        await completeOnboarding();
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsCompleting(false); // Reset the state if there's an error
    }
    // Note: We don't reset isCompleting in finally because we're redirecting
  };

  const handleNext = async () => {
    setIsNextLoading(true);
    try {
      // Save the current form data before advancing to the next step
      if (onSave) {
        // If there's a custom save function, use it
        await onSave();
      } else {
        // Otherwise use the context's saveProgress function
        // Pass the current formData to ensure we're saving the latest data
        await saveProgress(formData, false); // Don't show toast when saving during next step
      }
      // Then advance to the next step
      nextStep();
    } catch (error) {
      console.error("Error saving before next step:", error);
    } finally {
      setIsNextLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <Progress value={progressPercentage} className="h-2" />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Schritt {currentStep} von {totalSteps}
        </div>

        <div className="flex space-x-2">
          {currentStep > OnboardingStep.COMPANY_INFO && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSaving || isNextLoading || isCompleting}
            >
              Zurück
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || isNextLoading || isCompleting}
          >
            {isSaving ? "Speichern..." : "Speichern"}
          </Button>

          {currentStep < OnboardingStep.REVIEW ? (
            <Button
              onClick={handleNext}
              disabled={
                disableNext || isSaving || isNextLoading || isCompleting
              }
            >
              {isNextLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Weiter"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={
                disableNext || isSaving || isNextLoading || isCompleting
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Abschließen...
                </>
              ) : (
                "Onboarding abschließen"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
