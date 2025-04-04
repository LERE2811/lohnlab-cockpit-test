"use client";

import { Subsidiary } from "@/shared/model";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useCompany } from "@/context/company-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Define the steps for the givve onboarding process
export enum GivveOnboardingStep {
  CARD_TYPE = 1,
  REQUIRED_DOCUMENTS = 2,
  ORDER_FORMS = 3,
  READY_FOR_SIGNATURE = 4,
  SIGNED_FORMS = 5,
  DOCUMENTS_SUBMITTED = 6,
  VIDEO_IDENTIFICATION_LINK = 7,
  CARD_DESIGN_VERIFICATION = 8,
  VIDEO_IDENTIFICATION_COMPLETED = 9,
  INITIAL_INVOICE_RECEIVED = 10,
  INITIAL_INVOICE_PAID = 11,
  COMPLETED = 12,
}

// Define the types for the card options
export enum GivveCardType {
  STANDARD = "standard",
  LOGO = "logo",
  DESIGN = "design",
}

export interface GivveCardTypeDetails {
  type: GivveCardType;
  cardPrice: number;
  onboardingFee: number;
}

// Define the data structure for the givve onboarding
export interface GivveOnboardingData {
  cardType?: GivveCardType;
  departmentName?: string;
  logoFile?: string; // Path to the logo file in supabase storage
  designFile?: string; // Path to the design file in supabase storage
  requiresAdditionalDocuments?: boolean;
  documentsSubmitted?: boolean;
  videoIdentificationLink?: string;
  videoIdentificationCompleted?: boolean;
  initialInvoiceReceived?: boolean;
  initialInvoicePaid?: boolean;
  completed?: boolean;
  documents?: Record<string, any>; // Store documents data based on legal form
}

// Define the context type
interface GivveOnboardingContextType {
  currentStep: GivveOnboardingStep;
  formData: GivveOnboardingData;
  isLoading: boolean;
  isSaving: boolean;
  goToStep: (step: GivveOnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<GivveOnboardingData>) => void;
  saveProgress: (
    latestFormData?: Partial<GivveOnboardingData>,
    step?: GivveOnboardingStep,
  ) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

// Create the context
export const GivveOnboardingContext = createContext<GivveOnboardingContextType>(
  {
    currentStep: GivveOnboardingStep.CARD_TYPE,
    formData: {},
    isLoading: true,
    isSaving: false,
    goToStep: () => {},
    nextStep: () => {},
    prevStep: () => {},
    updateFormData: () => {},
    saveProgress: async () => {},
    completeOnboarding: async () => {},
  },
);

// Create the provider
export const GivveOnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const { subsidiary, refreshSubsidiary } = useCompany();

  const [currentStep, setCurrentStep] = useState<GivveOnboardingStep>(
    GivveOnboardingStep.CARD_TYPE,
  );
  const [formData, setFormData] = useState<GivveOnboardingData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing progress when the component mounts
  useEffect(() => {
    if (subsidiary) {
      loadProgress();
    }
  }, [subsidiary]);

  // Load progress from the database
  const loadProgress = async () => {
    if (!subsidiary) return;

    setIsLoading(true);
    try {
      // In the future, we would load the actual progress from the database
      // For now, we're just setting defaults
      const initialData: GivveOnboardingData = {
        cardType: undefined,
        departmentName: "",
        logoFile: "",
        designFile: "",
        requiresAdditionalDocuments: false,
        documentsSubmitted: false,
        videoIdentificationLink: "",
        videoIdentificationCompleted: false,
        initialInvoiceReceived: false,
        initialInvoicePaid: false,
        completed: false,
        documents: {},
      };

      setFormData(initialData);

      // Determine the current step based on the loaded data
      // This would be replaced with actual logic once we have database integration
      setCurrentStep(GivveOnboardingStep.CARD_TYPE);
    } catch (error) {
      console.error("Error loading givve onboarding progress:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden des Fortschritts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the form data
  const updateFormData = (data: Partial<GivveOnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Navigate to a specific step
  const goToStep = (step: GivveOnboardingStep) => {
    setCurrentStep(step);
  };

  // Move to the next step
  const nextStep = () => {
    setCurrentStep((prev) => {
      // Get the next step number
      const next = prev + 1;

      // Ensure we don't exceed the maximum step
      if (next > GivveOnboardingStep.COMPLETED) {
        return GivveOnboardingStep.COMPLETED;
      }

      // Check if we should be allowed to proceed based on form data
      if (
        next === GivveOnboardingStep.READY_FOR_SIGNATURE &&
        !formData.documentsSubmitted
      ) {
        toast({
          title: "Fehler",
          description:
            "Bitte laden Sie die Formulare herunter und füllen Sie sie aus.",
          variant: "destructive",
        });
        return prev;
      }

      // Allow progression to all steps
      return next;
    });
  };

  // Move to the previous step
  const prevStep = () => {
    setCurrentStep((prev) => {
      const next = prev - 1;
      // Ensure we don't go below the minimum step
      return next >= GivveOnboardingStep.CARD_TYPE
        ? next
        : GivveOnboardingStep.CARD_TYPE;
    });
  };

  // Save progress to the database
  const saveProgress = async (
    latestFormData?: Partial<GivveOnboardingData>,
    step?: GivveOnboardingStep,
  ) => {
    if (!subsidiary) return;

    setIsSaving(true);
    try {
      // Update the local state first
      const updatedData = latestFormData
        ? { ...formData, ...latestFormData }
        : formData;
      setFormData(updatedData);

      // In the future, we would save to the database here
      // For now, we're just simulating a save
      await new Promise((resolve) => setTimeout(resolve, 500));

      // If a step was provided, update it
      if (step) {
        setCurrentStep(step);
      } else {
        // If no specific step is provided, move to the next step
        nextStep();
      }

      toast({
        title: "Gespeichert",
        description: "Fortschritt wurde gespeichert.",
      });
    } catch (error) {
      console.error("Error saving givve onboarding progress:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern des Fortschritts.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Complete the onboarding process
  const completeOnboarding = async () => {
    if (!subsidiary) return;

    setIsSaving(true);
    try {
      // Update the local state
      setFormData((prev) => ({ ...prev, completed: true }));

      // In the future, we would save to the database here
      // For now, we're just simulating a save
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Fertig",
        description: "givve Card Onboarding abgeschlossen.",
      });

      // Refresh the subsidiary data to reflect the completed status
      await refreshSubsidiary();

      // Redirect to the dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing givve onboarding:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Abschließen des Onboardings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GivveOnboardingContext.Provider
      value={{
        currentStep,
        formData,
        isLoading,
        isSaving,
        goToStep,
        nextStep,
        prevStep,
        updateFormData,
        saveProgress,
        completeOnboarding,
      }}
    >
      {children}
    </GivveOnboardingContext.Provider>
  );
};

// Hook to use the givve onboarding context
export const useGivveOnboarding = () => {
  const context = useContext(GivveOnboardingContext);
  if (!context) {
    throw new Error(
      "useGivveOnboarding must be used within a GivveOnboardingProvider",
    );
  }
  return context;
};
