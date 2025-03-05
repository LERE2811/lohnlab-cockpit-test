"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "./user-context";
import { useCompany } from "./company-context";
import {
  OnboardingProgress,
  Company,
  ManagingDirector,
  PayrollContact,
} from "@/shared/model";

// Definiere die Schritte des Onboardings
export enum OnboardingStep {
  COMPANY_INFO = 1,
  ADDRESS = 2,
  COMMERCIAL_REGISTER = 3,
  MANAGING_DIRECTORS = 4,
  PAYROLL_INFO = 5,
  REVIEW = 6,
  COMPLETED = 7,
}

// Definiere die Daten für jeden Schritt
export interface OnboardingFormData {
  // Schritt 1: Unternehmensinformationen
  companyInfo: {
    name: string;
    tax_number: string;
    logo_url?: string;
  };
  // Schritt 2: Adresse
  address: {
    street: string;
    house_number: string;
    postal_code: string;
    city: string;
  };
  // Schritt 3: Handelsregister
  commercialRegister: {
    commercial_register: string;
    commercial_register_number: string;
    commercial_register_file_url?: string;
  };
  // Schritt 4: Geschäftsführer
  managingDirectors: ManagingDirector[];
  // Schritt 5: Lohnabrechnung
  payrollInfo: {
    payroll_processing: string;
    payroll_system?: string;
    payroll_contacts: PayrollContact[];
  };
}

// Initialer Zustand für das Formular
const initialFormData: OnboardingFormData = {
  companyInfo: {
    name: "",
    tax_number: "",
    logo_url: "",
  },
  address: {
    street: "",
    house_number: "",
    postal_code: "",
    city: "",
  },
  commercialRegister: {
    commercial_register: "",
    commercial_register_number: "",
    commercial_register_file_url: "",
  },
  managingDirectors: [],
  payrollInfo: {
    payroll_processing: "",
    payroll_system: "",
    payroll_contacts: [],
  },
};

// Definiere den Kontext-Typ
interface OnboardingContextType {
  currentStep: OnboardingStep;
  formData: OnboardingFormData;
  isLoading: boolean;
  isSaving: boolean;
  progress: number;
  setCurrentStep: (step: OnboardingStep) => void;
  updateFormData: <K extends keyof OnboardingFormData>(
    step: K,
    data: Partial<OnboardingFormData[K]>,
  ) => void;
  saveProgress: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

// Erstelle den Kontext
export const OnboardingContext = createContext<OnboardingContextType | null>(
  null,
);

// Provider-Komponente
export const OnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    OnboardingStep.COMPANY_INFO,
  );
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [onboardingId, setOnboardingId] = useState<string | null>(null);
  const previousCompanyId = useRef<string | null>(null);

  const { toast } = useToast();
  const { user } = useUser();
  const { company, isLoading: isCompanyLoading } = useCompany();

  // Berechne den Fortschritt in Prozent
  const progress = Math.round((currentStep / OnboardingStep.COMPLETED) * 100);

  // Lade den Onboarding-Fortschritt, wenn ein Unternehmen ausgewählt ist
  useEffect(() => {
    const loadOnboardingProgress = async () => {
      // Wenn kein Unternehmen ausgewählt ist oder das Unternehmen noch geladen wird, breche ab
      if (!company || isCompanyLoading) {
        return;
      }

      // Wenn das Unternehmen das gleiche ist wie zuvor, lade nicht erneut
      if (previousCompanyId.current === company.id) {
        return;
      }

      setIsLoading(true);
      previousCompanyId.current = company.id;

      try {
        // Prüfe, ob bereits ein Onboarding-Eintrag existiert
        const { data, error } = await supabase
          .from("onboarding_progress")
          .select("*")
          .eq("company_id", company.id)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          // Wenn Daten existieren, lade sie
          setOnboardingId(data.id);
          setCurrentStep(data.current_step);
          setFormData(
            (data.form_data as OnboardingFormData) || initialFormData,
          );

          // Fülle das Formular mit Daten aus der Company-Tabelle, falls vorhanden
          if (company) {
            const updatedFormData = { ...formData };

            // Unternehmensinformationen
            if (company.name) updatedFormData.companyInfo.name = company.name;
            if (company.tax_number)
              updatedFormData.companyInfo.tax_number = company.tax_number;
            if (company.logo_url)
              updatedFormData.companyInfo.logo_url = company.logo_url;

            // Adresse
            if (company.street) updatedFormData.address.street = company.street;
            if (company.house_number)
              updatedFormData.address.house_number = company.house_number;
            if (company.postal_code)
              updatedFormData.address.postal_code = company.postal_code;
            if (company.city) updatedFormData.address.city = company.city;

            // Handelsregister
            if (company.commercial_register)
              updatedFormData.commercialRegister.commercial_register =
                company.commercial_register;
            if (company.commercial_register_number)
              updatedFormData.commercialRegister.commercial_register_number =
                company.commercial_register_number;
            if (company.commercial_register_file_url)
              updatedFormData.commercialRegister.commercial_register_file_url =
                company.commercial_register_file_url;

            // Lohnabrechnung
            if (company.payroll_processing)
              updatedFormData.payrollInfo.payroll_processing =
                company.payroll_processing;
            if (company.payroll_system)
              updatedFormData.payrollInfo.payroll_system =
                company.payroll_system;

            setFormData(updatedFormData);
          }
        } else {
          // Wenn keine Daten existieren, erstelle einen neuen Eintrag
          const { data: newData, error: insertError } = await supabase
            .from("onboarding_progress")
            .insert({
              company_id: company.id,
              current_step: OnboardingStep.COMPANY_INFO,
              form_data: initialFormData,
            })
            .select()
            .single();

          if (insertError) throw insertError;

          if (newData) {
            setOnboardingId(newData.id);

            // Fülle das Formular mit Daten aus der Company-Tabelle, falls vorhanden
            if (company) {
              const updatedFormData = { ...initialFormData };

              // Unternehmensinformationen
              updatedFormData.companyInfo.name = company.name || "";

              setFormData(updatedFormData);
            }
          }
        }
      } catch (error) {
        console.error("Error loading onboarding progress:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden des Onboarding-Fortschritts",
          className: "border-red-500",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingProgress();
  }, [company, isCompanyLoading]);

  // Aktualisiere die Formulardaten für einen bestimmten Schritt
  const updateFormData = <K extends keyof OnboardingFormData>(
    step: K,
    data: Partial<OnboardingFormData[K]>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        ...data,
      },
    }));
  };

  // Speichere den Fortschritt
  const saveProgress = async () => {
    if (!company || !onboardingId || isCompanyLoading) return;

    setIsSaving(true);
    try {
      // Aktualisiere den Onboarding-Fortschritt
      const { error } = await supabase
        .from("onboarding_progress")
        .update({
          current_step: currentStep,
          form_data: formData,
          last_updated: new Date().toISOString(),
        })
        .eq("id", onboardingId);

      if (error) throw error;

      // Aktualisiere die Company-Tabelle mit den relevanten Daten
      const companyUpdateData: Partial<Company> = {};

      // Je nach aktuellem Schritt, aktualisiere die entsprechenden Felder
      if (currentStep >= OnboardingStep.COMPANY_INFO) {
        companyUpdateData.name = formData.companyInfo.name;
        companyUpdateData.tax_number = formData.companyInfo.tax_number;
        companyUpdateData.logo_url = formData.companyInfo.logo_url;
      }

      if (currentStep >= OnboardingStep.ADDRESS) {
        companyUpdateData.street = formData.address.street;
        companyUpdateData.house_number = formData.address.house_number;
        companyUpdateData.postal_code = formData.address.postal_code;
        companyUpdateData.city = formData.address.city;
      }

      if (currentStep >= OnboardingStep.COMMERCIAL_REGISTER) {
        companyUpdateData.commercial_register =
          formData.commercialRegister.commercial_register;
        companyUpdateData.commercial_register_number =
          formData.commercialRegister.commercial_register_number;
        companyUpdateData.commercial_register_file_url =
          formData.commercialRegister.commercial_register_file_url;
      }

      if (currentStep >= OnboardingStep.PAYROLL_INFO) {
        companyUpdateData.payroll_processing = formData.payrollInfo
          .payroll_processing as "Intern" | "Extern" | undefined;
        companyUpdateData.payroll_system = formData.payrollInfo
          .payroll_system as
          | "DATEV"
          | "Lexware"
          | "Sage"
          | "Lohn AG"
          | "Addison"
          | "Andere"
          | undefined;
      }

      companyUpdateData.onboarding_step = currentStep;

      // Aktualisiere die Company-Tabelle
      const { error: companyError } = await supabase
        .from("companies")
        .update(companyUpdateData)
        .eq("id", company.id);

      if (companyError) throw companyError;

      // Wenn wir beim Schritt Geschäftsführer sind, aktualisiere die managing_directors Tabelle
      if (
        currentStep === OnboardingStep.MANAGING_DIRECTORS &&
        formData.managingDirectors.length > 0
      ) {
        // Lösche zuerst alle vorhandenen Geschäftsführer
        const { error: deleteError } = await supabase
          .from("managing_directors")
          .delete()
          .eq("company_id", company.id);

        if (deleteError) throw deleteError;

        // Füge die neuen Geschäftsführer hinzu
        const managingDirectorsToInsert = formData.managingDirectors.map(
          (director) => ({
            company_id: company.id,
            firstname: director.firstname,
            lastname: director.lastname,
            email: director.email,
            phone: director.phone,
          }),
        );

        const { error: insertError } = await supabase
          .from("managing_directors")
          .insert(managingDirectorsToInsert);

        if (insertError) throw insertError;
      }

      // Wenn wir beim Schritt Lohnabrechnung sind, aktualisiere die payroll_contacts Tabelle
      if (
        currentStep === OnboardingStep.PAYROLL_INFO &&
        formData.payrollInfo.payroll_contacts.length > 0
      ) {
        // Lösche zuerst alle vorhandenen Lohnabrechnung-Kontakte
        const { error: deleteError } = await supabase
          .from("payroll_contacts")
          .delete()
          .eq("company_id", company.id);

        if (deleteError) throw deleteError;

        // Füge die neuen Lohnabrechnung-Kontakte hinzu
        const payrollContactsToInsert =
          formData.payrollInfo.payroll_contacts.map((contact) => ({
            company_id: company.id,
            firstname: contact.firstname,
            lastname: contact.lastname,
            email: contact.email,
            phone: contact.phone,
          }));

        const { error: insertError } = await supabase
          .from("payroll_contacts")
          .insert(payrollContactsToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Fortschritt gespeichert",
        description: "Ihr Fortschritt wurde erfolgreich gespeichert.",
        className: "border-green-500",
      });
    } catch (error) {
      console.error("Error saving onboarding progress:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern des Fortschritts",
        className: "border-red-500",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Schließe das Onboarding ab
  const completeOnboarding = async () => {
    if (!company || isCompanyLoading) return;

    setIsSaving(true);
    try {
      // Aktualisiere den Onboarding-Status in der Company-Tabelle
      const { error } = await supabase
        .from("companies")
        .update({
          onboarding_completed: true,
          onboarding_step: OnboardingStep.COMPLETED,
        })
        .eq("id", company.id);

      if (error) throw error;

      // Setze den aktuellen Schritt auf COMPLETED
      setCurrentStep(OnboardingStep.COMPLETED);

      toast({
        title: "Onboarding abgeschlossen",
        description: "Das Onboarding wurde erfolgreich abgeschlossen.",
        className: "border-green-500",
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Abschließen des Onboardings",
        className: "border-red-500",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Gehe zum nächsten Schritt
  const goToNextStep = () => {
    if (currentStep < OnboardingStep.COMPLETED) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
      saveProgress();
    }
  };

  // Gehe zum vorherigen Schritt
  const goToPreviousStep = () => {
    if (currentStep > OnboardingStep.COMPANY_INFO) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  // Reset the onboarding state when the company changes
  useEffect(() => {
    if (company && previousCompanyId.current !== company.id) {
      setFormData(initialFormData);
      setCurrentStep(OnboardingStep.COMPANY_INFO);
      setOnboardingId(null);
    }
  }, [company]);

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        formData,
        isLoading,
        isSaving,
        progress,
        setCurrentStep,
        updateFormData,
        saveProgress,
        completeOnboarding,
        goToNextStep,
        goToPreviousStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

// Hook für den einfachen Zugriff auf den Kontext
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
