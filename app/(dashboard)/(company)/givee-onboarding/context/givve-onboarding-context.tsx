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
  SIGNED_FORMS = 4,
  COMPLETED = 5,
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
  status?: string; // Admin-managed status for tracking onboarding progress
  documents?: Record<string, any>; // Store documents data based on legal form
}

// Define the context type
interface GivveOnboardingContextType {
  currentStep: GivveOnboardingStep;
  formData: GivveOnboardingData;
  isLoading: boolean;
  isSaving: boolean;
  progress?: {
    video_identification_link?: string;
    video_identification_completed?: boolean;
    initial_invoice_received?: boolean;
    initial_invoice_paid?: boolean;
  };
  goToStep: (step: GivveOnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<GivveOnboardingData>) => void;
  saveProgress: (
    latestFormData?: Partial<GivveOnboardingData>,
    step?: GivveOnboardingStep,
  ) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completeStep: () => void;
}

// Create the context
export const GivveOnboardingContext = createContext<GivveOnboardingContextType>(
  {
    currentStep: GivveOnboardingStep.CARD_TYPE,
    formData: {},
    isLoading: true,
    isSaving: false,
    progress: {
      video_identification_link: undefined,
      video_identification_completed: false,
      initial_invoice_received: false,
      initial_invoice_paid: false,
    },
    goToStep: () => {},
    nextStep: () => {},
    prevStep: () => {},
    updateFormData: () => {},
    saveProgress: async () => {},
    completeOnboarding: async () => {},
    completeStep: () => {},
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
  const [progress, setProgress] = useState<
    GivveOnboardingContextType["progress"]
  >({
    video_identification_link: undefined,
    video_identification_completed: false,
    initial_invoice_received: false,
    initial_invoice_paid: false,
  });

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
      // First check if we have an existing progress record
      const { data: progressData, error: fetchError } = await supabase
        .from("givve_onboarding_progress")
        .select("*")
        .eq("subsidiary_id", subsidiary.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching givve onboarding progress:", fetchError);
        throw fetchError;
      }

      if (progressData) {
        // We have existing progress, use it
        const formDataFromProgress = progressData.form_data || {};

        // Update progress state
        setProgress({
          video_identification_link: progressData.video_identification_link,
          video_identification_completed:
            progressData.video_identification_completed,
          initial_invoice_received: progressData.initial_invoice_received,
          initial_invoice_paid: progressData.initial_invoice_paid,
        });

        // If we have file paths, regenerate signed URLs
        if (
          formDataFromProgress.logoFile ||
          formDataFromProgress.designFile ||
          (formDataFromProgress.documents &&
            Object.keys(formDataFromProgress.documents).length > 0)
        ) {
          try {
            // Regenerate signed URLs for document files
            if (formDataFromProgress.documents) {
              for (const [key, value] of Object.entries(
                formDataFromProgress.documents,
              )) {
                if (
                  value &&
                  typeof value === "object" &&
                  "filePath" in value &&
                  typeof value.filePath === "string"
                ) {
                  const { data: urlData } = await supabase.storage
                    .from("onboarding_documents")
                    .createSignedUrl(value.filePath, 3600);

                  if (urlData) {
                    formDataFromProgress.documents[key].signedUrl =
                      urlData.signedUrl;
                  }
                }
              }
            }

            // Regenerate signed URLs for logo and design files
            if (
              formDataFromProgress.logoFile &&
              typeof formDataFromProgress.logoFile === "string"
            ) {
              const { data: logoUrlData } = await supabase.storage
                .from("onboarding_documents")
                .createSignedUrl(formDataFromProgress.logoFile, 3600);

              if (logoUrlData) {
                formDataFromProgress.logoFileUrl = logoUrlData.signedUrl;
              }
            }

            if (
              formDataFromProgress.designFile &&
              typeof formDataFromProgress.designFile === "string"
            ) {
              const { data: designUrlData } = await supabase.storage
                .from("onboarding_documents")
                .createSignedUrl(formDataFromProgress.designFile, 3600);

              if (designUrlData) {
                formDataFromProgress.designFileUrl = designUrlData.signedUrl;
              }
            }
          } catch (error) {
            console.error("Error regenerating signed URLs:", error);
          }
        }

        setFormData(formDataFromProgress);
        setCurrentStep(progressData.current_step);
      } else {
        // No existing progress, initialize with defaults
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
        setCurrentStep(GivveOnboardingStep.CARD_TYPE);
      }
    } catch (error) {
      console.error("Error loading givve onboarding progress:", error);
      setTimeout(() => {
        toast({
          title: "Fehler",
          description: "Fehler beim Laden des Fortschritts.",
          variant: "destructive",
        });
      }, 0);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the form data
  const updateFormData = (data: Partial<GivveOnboardingData>) => {
    console.log("updateFormData called with:", data);

    // Special handling for documents field - ensure fields like firstName, lastName etc. go into documents
    if (
      data.documents &&
      currentStep === GivveOnboardingStep.REQUIRED_DOCUMENTS
    ) {
      // Get all properties that should be in the documents object but might be at the top level
      const documentProps = [
        "firstName",
        "lastName",
        "birthDate",
        "birthPlace",
        "nationality",
        "street",
        "houseNumber",
        "postalCode",
        "city",
        "industry",
        "hasPep",
        "pepDetails",
      ];

      // Create a documents object with existing data.documents plus any top-level fields
      const updatedDocuments = { ...data.documents };

      // Move any document fields from the top level to the documents object
      for (const prop of documentProps) {
        if (data[prop as keyof typeof data] !== undefined) {
          // Special handling for boolean values to ensure they're properly saved
          if (prop === "hasPep") {
            updatedDocuments[prop] = Boolean(data[prop as keyof typeof data]);
            console.log(
              `Saving hasPep in documents as boolean:`,
              updatedDocuments[prop],
            );
          } else {
            updatedDocuments[prop] = data[prop as keyof typeof data];
          }

          // Remove from top level to avoid duplication
          delete data[prop as keyof typeof data];
        }
      }

      // Update the documents field with our cleaned up version
      data.documents = updatedDocuments;
    }

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
        next === GivveOnboardingStep.SIGNED_FORMS &&
        !formData.documentsSubmitted
      ) {
        setTimeout(() => {
          toast({
            title: "Fehler",
            description:
              "Bitte laden Sie die Formulare herunter und füllen Sie sie aus.",
            variant: "destructive",
          });
        }, 0);
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

      // Load or create givve_onboarding_progress record
      const { data: progressData, error: fetchError } = await supabase
        .from("givve_onboarding_progress")
        .select("id")
        .eq("subsidiary_id", subsidiary.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching givve onboarding progress:", fetchError);
        throw fetchError;
      }

      // Deep clone to avoid reference issues and remove undefined values
      const cleanedData = JSON.parse(JSON.stringify(updatedData));

      // Prepare progress update data
      const progressUpdateData: Record<string, any> = {
        current_step: step !== undefined ? step : currentStep,
        form_data: cleanedData,
        last_updated: new Date().toISOString(),
      };

      // Update specific progress fields based on form data
      if (cleanedData.documentsSubmitted !== undefined) {
        progressUpdateData.documents_submitted = cleanedData.documentsSubmitted;
      }
      // Preserve existing status
      if (cleanedData.status !== undefined) {
        progressUpdateData.status = cleanedData.status;
      }

      if (progressData?.id) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("givve_onboarding_progress")
          .update(progressUpdateData)
          .eq("id", progressData.id);

        if (updateError) {
          console.error(
            "Error updating givve onboarding progress:",
            updateError,
          );
          throw updateError;
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from("givve_onboarding_progress")
          .insert({
            subsidiary_id: subsidiary.id,
            ...progressUpdateData,
          });

        if (insertError) {
          console.error(
            "Error creating givve onboarding progress:",
            insertError,
          );
          throw insertError;
        }
      }

      // Update subsidiary table with relevant fields
      const subsidiaryUpdateData: Record<string, any> = {
        givve_onboarding_step: step !== undefined ? step : currentStep,
      };

      // Add card type if available
      if (cleanedData.cardType) {
        subsidiaryUpdateData.givve_card_design_type = cleanedData.cardType;
      }

      // Add department name if available
      if (cleanedData.departmentName) {
        subsidiaryUpdateData.givve_card_second_line =
          cleanedData.departmentName;
      }

      // Add industry category if available
      if (cleanedData.documents?.industry) {
        subsidiaryUpdateData.givve_industry_category =
          cleanedData.documents.industry;
      }

      // Update file URLs if available
      if (cleanedData.logoFile) {
        subsidiaryUpdateData.givve_company_logo_url = cleanedData.logoFile;
      }
      if (cleanedData.designFile) {
        subsidiaryUpdateData.givve_card_design_url = cleanedData.designFile;
      }

      // Add video identification link if available
      if (cleanedData.videoIdentificationLink) {
        subsidiaryUpdateData.givve_video_identification_link =
          cleanedData.videoIdentificationLink;
      }

      // Update order forms downloaded status if available
      if (cleanedData.documents?.orderForms) {
        if (cleanedData.documents.orderForms.bestellformularDownloaded) {
          subsidiaryUpdateData.givve_order_forms_downloaded = true;
        }
        if (cleanedData.documents.orderForms.dokumentationsbogenDownloaded) {
          subsidiaryUpdateData.givve_documentation_forms_downloaded = true;
        }
      }

      const { error: subsidiaryError } = await supabase
        .from("subsidiaries")
        .update(subsidiaryUpdateData)
        .eq("id", subsidiary.id);

      if (subsidiaryError) {
        console.error("Error updating subsidiary:", subsidiaryError);
      }

      // If a step was provided, update it
      if (step) {
        setCurrentStep(step);
      } else {
        // If no specific step is provided, move to the next step
        nextStep();
      }

      setTimeout(() => {
        toast({
          title: "Gespeichert",
          description: "Fortschritt wurde gespeichert.",
        });
      }, 0);
    } catch (error) {
      console.error("Error saving givve onboarding progress:", error);
      setTimeout(() => {
        toast({
          title: "Fehler",
          description: "Fehler beim Speichern des Fortschritts.",
          variant: "destructive",
        });
      }, 0);
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

      // Find the progress record
      const { data: progressData, error: fetchError } = await supabase
        .from("givve_onboarding_progress")
        .select("id")
        .eq("subsidiary_id", subsidiary.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching givve onboarding progress:", fetchError);
        throw fetchError;
      }

      // Update the progress record
      if (progressData?.id) {
        const { error: updateError } = await supabase
          .from("givve_onboarding_progress")
          .update({
            completed: true,
            form_data: { ...formData, completed: true },
            last_updated: new Date().toISOString(),
          })
          .eq("id", progressData.id);

        if (updateError) {
          console.error("Error completing givve onboarding:", updateError);
          throw updateError;
        }
      } else {
        // Create a new record if none exists
        const { error: insertError } = await supabase
          .from("givve_onboarding_progress")
          .insert({
            subsidiary_id: subsidiary.id,
            current_step: currentStep,
            form_data: { ...formData, completed: true },
            completed: true,
          });

        if (insertError) {
          console.error(
            "Error creating givve onboarding completion:",
            insertError,
          );
          throw insertError;
        }
      }

      // Update the subsidiary record
      const { error: subsidiaryError } = await supabase
        .from("subsidiaries")
        .update({
          givve_onboarding_completed: true,
          givve_onboarding_step: currentStep,
        })
        .eq("id", subsidiary.id);

      if (subsidiaryError) {
        console.error(
          "Error updating subsidiary for completion:",
          subsidiaryError,
        );
      }

      setTimeout(() => {
        toast({
          title: "Fertig",
          description: "givve Card Onboarding abgeschlossen.",
        });
      }, 0);

      // Refresh the subsidiary data to reflect the completed status
      await refreshSubsidiary();

      // Redirect to the dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing givve onboarding:", error);
      setTimeout(() => {
        toast({
          title: "Fehler",
          description: "Fehler beim Abschließen des Onboardings.",
          variant: "destructive",
        });
      }, 0);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper method to complete a step and move to the next one
  const completeStep = () => {
    nextStep();
  };

  return (
    <GivveOnboardingContext.Provider
      value={{
        currentStep,
        formData,
        isLoading,
        isSaving,
        progress,
        goToStep,
        nextStep,
        prevStep,
        updateFormData,
        saveProgress,
        completeOnboarding,
        completeStep,
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
