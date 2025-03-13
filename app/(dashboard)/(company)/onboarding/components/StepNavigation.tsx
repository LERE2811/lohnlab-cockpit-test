"use client";

import { useOnboarding, OnboardingStep } from "../context/onboarding-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState, ReactNode, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StepNavigationProps {
  onSave?: () => Promise<void>;
  onComplete?: () => Promise<void>;
  disableNext?: boolean;
  saveButtonText?: string;
  saveButtonIcon?: ReactNode;
  isSaving?: boolean;
  validationMessage?: string;
}

export const StepNavigation = ({
  onSave,
  onComplete,
  disableNext = false,
  saveButtonText,
  saveButtonIcon,
  isSaving: externalIsSaving,
  validationMessage,
}: StepNavigationProps) => {
  const {
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    saveProgress,
    completeOnboarding,
    isSaving: contextIsSaving,
    formData,
    areAllStepsCompleted,
  } = useOnboarding();

  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [nextStepDisabled, setNextStepDisabled] = useState(disableNext);

  // Use external isSaving if provided, otherwise use context isSaving
  const isSaving =
    externalIsSaving !== undefined ? externalIsSaving : contextIsSaving;

  const totalSteps = Object.keys(OnboardingStep).length / 2; // Divide by 2 because enum has both string and number keys
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Check if the next step would be the Review step
  const nextStepIsReview = currentStep === OnboardingStep.GIVVE_CARD;

  // Update the nextStepDisabled state when dependencies change
  useEffect(() => {
    // Special case: always enable Next button for the GIVVE_CARD step
    if (currentStep === OnboardingStep.GIVVE_CARD) {
      setNextStepDisabled(false);
      return;
    }

    // If the next step is Review, check if all previous steps are completed
    if (nextStepIsReview) {
      const allCompleted = areAllStepsCompleted();

      // Force a re-check to ensure we have the latest status
      setTimeout(() => {
        const rechecked = areAllStepsCompleted();
        setNextStepDisabled(disableNext || !rechecked);
      }, 500);

      setNextStepDisabled(disableNext || !allCompleted);
    } else {
      setNextStepDisabled(disableNext);
    }
  }, [
    disableNext,
    nextStepIsReview,
    areAllStepsCompleted,
    formData,
    currentStep,
  ]);

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    } else {
      await saveProgress(formData);
    }
  };

  const handleComplete = async () => {
    if (disableNext) {
      setShowValidationError(true);
      return;
    }

    setIsCompleting(true);
    try {
      if (onComplete) {
        await onComplete();
      } else {
        await completeOnboarding();
      }
    } catch (error) {
      setIsCompleting(false); // Reset the state if there's an error
    }
    // Note: We don't reset isCompleting in finally because we're redirecting
  };

  const handleNext = async () => {
    // Special case: Always proceed if we're on the givve Card step
    if (currentStep === OnboardingStep.GIVVE_CARD) {
      setShowValidationError(false);
      setIsNextLoading(true);
      try {
        // If there's a custom save function, use it
        if (onSave) {
          await onSave();
        } else {
          // Otherwise use the context's saveProgress function
          await saveProgress(formData);
        }
        // Then advance to the next step
        nextStep();
      } catch (error) {
        console.error("Error saving givve Card step:", error);
      } finally {
        setIsNextLoading(false);
      }
      return;
    }

    // If form validation fails, show error and don't proceed
    if (nextStepDisabled) {
      setShowValidationError(true);

      // If the next step is Review and not all steps are completed, show a specific message
      if (nextStepIsReview && !areAllStepsCompleted()) {
        // This will be displayed if validationMessage is not provided
        return;
      }

      return;
    }

    setShowValidationError(false);
    setIsNextLoading(true);
    try {
      // Save the current form data before advancing to the next step
      if (onSave) {
        // If there's a custom save function, use it
        await onSave();
      } else {
        // Otherwise use the context's saveProgress function
        // Pass the current formData to ensure we're saving the latest data
        await saveProgress(formData); // Don't show toast when saving during next step
      }
      // Then advance to the next step
      nextStep();
    } catch (error) {
      console.error("Error saving before next step:", error);
    } finally {
      setIsNextLoading(false);
    }
  };

  // Get a custom validation message for the Review step
  const getValidationMessage = () => {
    if (nextStepIsReview && !areAllStepsCompleted()) {
      return "Bitte schließen Sie zuerst alle vorherigen Schritte ab, bevor Sie zur Überprüfung fortfahren.";
    }
    return (
      validationMessage ||
      "Bitte füllen Sie alle erforderlichen Felder aus, bevor Sie fortfahren."
    );
  };

  return (
    <div className="mt-8 space-y-4">
      <Progress value={progressPercentage} className="h-2" />

      {showValidationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{getValidationMessage()}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Schritt {currentStep} von {totalSteps}
        </div>

        <div className="flex space-x-2">
          {currentStep > OnboardingStep.GESELLSCHAFT && (
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
                isSaving ||
                isNextLoading ||
                isCompleting ||
                (currentStep !== OnboardingStep.GIVVE_CARD && nextStepDisabled)
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
              disabled={isSaving || isNextLoading || isCompleting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Abschließen...
                </>
              ) : (
                <>
                  {saveButtonIcon}
                  {saveButtonText || "Onboarding abschließen"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
