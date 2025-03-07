"use client";

import { OnboardingProgress, Subsidiary } from "@/shared/model";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useCompany } from "@/context/company-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Define the steps for the onboarding process
export enum OnboardingStep {
  COMPANY_INFO = 1,
  MANAGING_DIRECTORS = 2,
  PAYROLL_PROCESSING = 3, // Combined step for payroll processing and contacts
  WORKS_COUNCIL = 4,
  COLLECTIVE_AGREEMENT = 5,
  GIVVE_CARD = 6,
  HEADQUARTERS = 7,
  BENEFICIAL_OWNERS = 8,
  REVIEW = 9,
}

// For backward compatibility with existing data
const mapLegacyStep = (step: number): OnboardingStep => {
  // If the step is PAYROLL_CONTACTS (3 in the old enum), map it to PAYROLL_PROCESSING
  if (step === 3) {
    return OnboardingStep.PAYROLL_PROCESSING;
  }
  // For steps after PAYROLL_CONTACTS, decrement by 1 to account for the merged step
  if (step > 3) {
    return (step - 1) as OnboardingStep;
  }
  return step as OnboardingStep;
};

// Define the context type
interface OnboardingContextType {
  currentStep: OnboardingStep;
  formData: Record<string, any>;
  progress: OnboardingProgress | null;
  isLoading: boolean;
  isSaving: boolean;
  goToStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Record<string, any>) => void;
  saveProgress: (
    latestFormData?: Record<string, any>,
    showToast?: boolean,
  ) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

// Create the context
export const OnboardingContext = createContext<OnboardingContextType>({
  currentStep: OnboardingStep.COMPANY_INFO,
  formData: {},
  progress: null,
  isLoading: true,
  isSaving: false,
  goToStep: () => {},
  nextStep: () => {},
  prevStep: () => {},
  updateFormData: () => {},
  saveProgress: async () => {},
  completeOnboarding: async () => {},
});

// Create the provider component
export const OnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    OnboardingStep.COMPANY_INFO,
  );
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { subsidiary } = useCompany();
  const { toast } = useToast();
  const router = useRouter();

  // Load existing progress when subsidiary changes
  useEffect(() => {
    const loadProgress = async () => {
      if (!subsidiary) return;

      setIsLoading(true);
      try {
        console.log("Loading progress for subsidiary:", subsidiary.id);

        // Check if there's existing progress for this subsidiary
        const { data, error } = await supabase
          .from("onboarding_progress")
          .select("*")
          .eq("subsidiary_id", subsidiary.id)
          .order("created_at", { ascending: false }) // Get the most recent entry
          .limit(1);

        if (error) {
          console.error("Error loading onboarding progress:", error);
          toast({
            title: "Fehler",
            description: "Fehler beim Laden des Onboarding-Fortschritts.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        console.log("Progress data:", data);

        // If we have existing progress, use it
        if (data && data.length > 0) {
          const progressData = data[0];
          setProgress(progressData);

          // Ensure form_data is an object, not null
          const formDataFromProgress = progressData.form_data || {};
          console.log("Form data from progress:", formDataFromProgress);

          // If we have file metadata, regenerate signed URLs
          if (formDataFromProgress.file_metadata) {
            try {
              const { regenerateSignedUrls } = await import(
                "@/utils/file-upload"
              );
              const updatedFileMetadata = await regenerateSignedUrls(
                formDataFromProgress.file_metadata,
              );
              formDataFromProgress.file_metadata = updatedFileMetadata;
            } catch (error) {
              console.error("Error regenerating signed URLs:", error);
            }
          }

          setFormData(formDataFromProgress);

          // Map legacy step numbers to the new enum if needed
          setCurrentStep(mapLegacyStep(progressData.current_step));
          setIsLoading(false);
        } else {
          console.log("No existing progress found, creating new entry");
          // Only create a new progress entry if none exists
          const initialFormData = {}; // Empty object for initial form data

          const { data: newProgress, error: createError } = await supabase
            .from("onboarding_progress")
            .insert({
              subsidiary_id: subsidiary.id,
              current_step: OnboardingStep.COMPANY_INFO,
              form_data: initialFormData,
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating onboarding progress:", createError);
            toast({
              title: "Fehler",
              description: "Fehler beim Erstellen des Onboarding-Fortschritts.",
              variant: "destructive",
            });
          } else {
            console.log("New progress created:", newProgress);
            setProgress(newProgress);
            setFormData(initialFormData);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in loadProgress:", error);
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [subsidiary, toast]);

  // Go to a specific step
  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  // Go to the next step
  const nextStep = () => {
    if (currentStep < OnboardingStep.REVIEW) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  // Go to the previous step
  const prevStep = () => {
    if (currentStep > OnboardingStep.COMPANY_INFO) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  // Update form data
  const updateFormData = (data: Record<string, any>) => {
    console.log("Updating form data with:", data);

    // Validate the incoming data
    if (!data || typeof data !== "object") {
      console.error("Invalid data provided to updateFormData:", data);
      return;
    }

    // Remove any undefined values which can cause issues with JSON serialization
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    console.log("Cleaned data for update:", cleanedData);

    setFormData((prev) => {
      // Create a deep copy of the previous state to avoid reference issues
      const prevCopy = { ...prev };

      // Merge the previous state with the new data
      const updated = {
        ...prevCopy,
        ...cleanedData,
      };

      console.log("Previous form data:", prevCopy);
      console.log("Updated form data:", updated);
      return updated;
    });
  };

  // Save progress to the database
  const saveProgress = async (
    latestFormData?: Record<string, any>,
    showToast: boolean = true,
  ) => {
    if (!subsidiary || !progress) {
      console.error("Cannot save progress: subsidiary or progress is null");
      return;
    }

    setIsSaving(true);
    try {
      // Use the latest form data if provided, otherwise use the state
      const newData = latestFormData || formData;
      console.log("New form data to save:", newData);

      // Merge with existing form data instead of replacing it
      const mergedFormData = {
        ...formData, // Start with current state
        ...newData, // Override with new data
      };

      console.log("Merged form data for saving:", mergedFormData);

      // Ensure formData is a valid object
      const validFormData =
        mergedFormData && typeof mergedFormData === "object"
          ? mergedFormData
          : {};
      console.log("Validated form data for saving:", validFormData);

      const { data, error } = await supabase
        .from("onboarding_progress")
        .update({
          current_step: currentStep,
          form_data: validFormData,
          last_updated: new Date().toISOString(),
        })
        .eq("id", progress.id)
        .select();

      if (error) {
        console.error("Error saving onboarding progress:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Speichern des Onboarding-Fortschritts.",
          variant: "destructive",
        });
        return;
      }

      console.log("Save response data:", data);

      // Also update the subsidiary table with the current step
      const { error: subsidiaryError } = await supabase
        .from("subsidiaries")
        .update({
          onboarding_step: currentStep,
        })
        .eq("id", subsidiary.id);

      if (subsidiaryError) {
        console.error("Error updating subsidiary step:", subsidiaryError);
      }

      if (showToast) {
        toast({
          title: "Erfolg",
          description: "Fortschritt gespeichert.",
        });
      }

      // Update the local state with the merged data
      setFormData(validFormData);

      // Verify the save by fetching the latest data
      const { data: verifyData, error: verifyError } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("id", progress.id)
        .single();

      if (verifyError) {
        console.error("Error verifying saved data:", verifyError);
      } else {
        console.log("Verified saved data:", verifyData);
        console.log("Verified form_data:", verifyData.form_data);

        // Update local state if the data from the server is different
        if (
          JSON.stringify(verifyData.form_data) !== JSON.stringify(validFormData)
        ) {
          console.warn(
            "Local form data differs from server data, updating local state",
          );
          setFormData(verifyData.form_data || {});
        }
      }
    } catch (error) {
      console.error("Error in saveProgress:", error);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Complete the onboarding process
  const completeOnboarding = async () => {
    if (!subsidiary || !progress) return;

    setIsSaving(true);
    try {
      // Update subsidiary data from form
      const subsidiaryUpdateData: Partial<Subsidiary> = {
        onboarding_completed: true,
        onboarding_step: OnboardingStep.REVIEW,
        // Map form data to subsidiary fields
        tax_number: formData.tax_number,
        logo_url: formData.logo_url,
        street: formData.street,
        house_number: formData.house_number,
        postal_code: formData.postal_code,
        city: formData.city,
        commercial_register: formData.commercial_register,
        commercial_register_number: formData.commercial_register_number,
        commercial_register_file_url: formData.commercial_register_file_url,

        // Payroll processing fields
        payroll_processing: formData.payroll_processing,
        payroll_system: formData.payroll_system,

        // Works council field
        has_works_council: formData.has_works_council,

        // Collective agreement fields
        has_collective_agreement: formData.has_collective_agreement,
        collective_agreement_type: formData.collective_agreement_type,
        collective_agreement_document_url:
          formData.collective_agreement_document_url,

        // Givve Card related fields
        has_givve_card: formData.has_givve_card,
        givve_legal_form: formData.givve_legal_form,
        givve_card_design_type: formData.givve_card_design_type,
        givve_company_logo_url: formData.givve_company_logo_url,
        givve_card_design_url: formData.givve_card_design_url,
        givve_standard_postal_code: formData.givve_standard_postal_code,
        givve_card_second_line: formData.givve_card_second_line,
        givve_loading_date: formData.givve_loading_date,
        givve_industry_category: formData.givve_industry_category,

        // Headquarters information
        headquarters_street: formData.headquarters_street,
        headquarters_house_number: formData.headquarters_house_number,
        headquarters_postal_code: formData.headquarters_postal_code,
        headquarters_city: formData.headquarters_city,
        headquarters_state: formData.headquarters_state,
        headquarters_name: formData.headquarters_name,

        // Additional amenities
        has_canteen: formData.has_canteen,
        has_ev_charging: formData.has_ev_charging,
      };

      // If we have file metadata, ensure it's included in the form_data
      if (formData.file_metadata) {
        // Make sure we're not losing any file metadata during completion
        const updatedFormData = {
          ...formData,
          file_metadata: formData.file_metadata,
        };

        // Update the form data in the progress record
        const { error: progressUpdateError } = await supabase
          .from("onboarding_progress")
          .update({
            form_data: updatedFormData,
            last_updated: new Date().toISOString(),
          })
          .eq("id", progress.id);

        if (progressUpdateError) {
          console.error("Error updating file metadata:", progressUpdateError);
        }
      }

      // Update subsidiary
      const { error: subsidiaryError } = await supabase
        .from("subsidiaries")
        .update(subsidiaryUpdateData)
        .eq("id", subsidiary.id);

      if (subsidiaryError) {
        console.error("Error updating subsidiary:", subsidiaryError);
        toast({
          title: "Fehler",
          description: "Fehler beim Aktualisieren der Gesellschaft.",
          variant: "destructive",
        });
        return;
      }

      // Update onboarding progress
      const { error: progressError } = await supabase
        .from("onboarding_progress")
        .update({
          current_step: OnboardingStep.REVIEW,
          form_data: formData || {}, // Ensure we're not sending null
          last_updated: new Date().toISOString(),
        })
        .eq("id", progress.id);

      if (progressError) {
        console.error("Error updating onboarding progress:", progressError);
        toast({
          title: "Fehler",
          description: "Fehler beim Aktualisieren des Onboarding-Fortschritts.",
          variant: "destructive",
        });
        return;
      }

      // Save payroll contacts to the database
      if (formData.payroll_contacts && formData.payroll_contacts.length > 0) {
        // First, delete existing payroll contacts
        const { error: deleteError } = await supabase
          .from("payroll_contacts")
          .delete()
          .eq("subsidiary_id", subsidiary.id);

        if (deleteError) {
          console.error(
            "Error deleting existing payroll contacts:",
            deleteError,
          );
        }

        // Then, insert new payroll contacts
        const payrollContactsData = formData.payroll_contacts.map(
          (contact: any) => ({
            subsidiary_id: subsidiary.id,
            firstname: contact.firstname,
            lastname: contact.lastname,
            email: contact.email,
            phone: contact.phone,
            company_name: contact.company_name,
          }),
        );

        const { error: insertError } = await supabase
          .from("payroll_contacts")
          .insert(payrollContactsData);

        if (insertError) {
          console.error("Error inserting payroll contacts:", insertError);
          toast({
            title: "Fehler",
            description:
              "Fehler beim Speichern der Ansprechpartner für die Lohnabrechnung.",
            variant: "destructive",
          });
        }
      }

      // Save managing directors to the database
      if (
        formData.managing_directors &&
        formData.managing_directors.length > 0
      ) {
        // First, delete existing managing directors
        const { error: deleteError } = await supabase
          .from("managing_directors")
          .delete()
          .eq("subsidiary_id", subsidiary.id);

        if (deleteError) {
          console.error(
            "Error deleting existing managing directors:",
            deleteError,
          );
        }

        // Then, insert new managing directors
        const managingDirectorsData = formData.managing_directors.map(
          (director: any) => ({
            subsidiary_id: subsidiary.id,
            firstname: director.firstname,
            lastname: director.lastname,
            email: director.email,
            phone: director.phone,
          }),
        );

        const { error: insertError } = await supabase
          .from("managing_directors")
          .insert(managingDirectorsData);

        if (insertError) {
          console.error("Error inserting managing directors:", insertError);
          toast({
            title: "Fehler",
            description: "Fehler beim Speichern der Geschäftsführer.",
            variant: "destructive",
          });
        }
      }

      // Save beneficial owners to the database
      if (formData.beneficial_owners && formData.beneficial_owners.length > 0) {
        // First, delete existing beneficial owners
        const { error: deleteError } = await supabase
          .from("beneficial_owners")
          .delete()
          .eq("subsidiary_id", subsidiary.id);

        if (deleteError) {
          console.error(
            "Error deleting existing beneficial owners:",
            deleteError,
          );
        }

        // Then, insert new beneficial owners
        const beneficialOwnersData = formData.beneficial_owners.map(
          (owner: any) => ({
            subsidiary_id: subsidiary.id,
            firstname: owner.firstname,
            lastname: owner.lastname,
            birth_date: owner.birth_date,
            nationality: owner.nationality,
            ownership_percentage: owner.ownership_percentage,
            has_public_office: owner.has_public_office,
            public_office_description: owner.public_office_description,
          }),
        );

        const { error: insertError } = await supabase
          .from("beneficial_owners")
          .insert(beneficialOwnersData);

        if (insertError) {
          console.error("Error inserting beneficial owners:", insertError);
          toast({
            title: "Fehler",
            description:
              "Fehler beim Speichern der wirtschaftlich Berechtigten.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Erfolg",
        description: "Onboarding abgeschlossen!",
      });

      // Redirect to the success page
      router.push("/onboarding/success");
    } catch (error) {
      console.error("Error in completeOnboarding:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        formData,
        progress,
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
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
