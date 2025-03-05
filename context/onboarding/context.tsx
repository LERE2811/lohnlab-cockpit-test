"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "../user-context";
import { useCompany } from "../company-context";
import {
  OnboardingStep,
  OnboardingFormData,
  initialFormData,
  OnboardingContextType,
} from "./types";
import {
  loadOnboardingData,
  createOnboardingEntry,
  updateOnboardingProgress,
  updateCompanyData,
  saveManagingDirectors,
  savePayrollContacts,
  completeOnboardingProcess,
} from "./api";

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
    const fetchOnboardingProgress = async () => {
      // Wenn kein Unternehmen ausgewählt ist oder das Unternehmen noch geladen wird, breche ab
      if (!company || isCompanyLoading) {
        setIsLoading(false);
        return;
      }

      // Wenn das Unternehmen das gleiche ist wie zuvor, lade nicht erneut
      if (previousCompanyId.current === company.id) {
        return;
      }

      // Reset state when company changes
      setFormData(initialFormData);
      setCurrentStep(OnboardingStep.COMPANY_INFO);
      setOnboardingId(null);

      setIsLoading(true);
      previousCompanyId.current = company.id;

      try {
        // Lade Daten aus der Datenbank
        const { onboardingData, managingDirectorsData, payrollContactsData } =
          await loadOnboardingData(company.id);

        if (onboardingData) {
          // Wenn Daten existieren, lade sie
          setOnboardingId(onboardingData.id);
          setCurrentStep(onboardingData.current_step);

          // Kombiniere die Daten aus dem Onboarding-Fortschritt mit den Daten aus der Datenbank
          const formDataFromProgress =
            (onboardingData.form_data as OnboardingFormData) || initialFormData;

          // Füge die Geschäftsführer hinzu
          formDataFromProgress.managingDirectors =
            managingDirectorsData.length > 0
              ? managingDirectorsData
              : formDataFromProgress.managingDirectors;

          // Füge die Lohnabrechnung-Kontakte hinzu
          formDataFromProgress.payrollInfo.payroll_contacts =
            payrollContactsData.length > 0
              ? payrollContactsData
              : formDataFromProgress.payrollInfo.payroll_contacts;

          setFormData(formDataFromProgress);

          // Fülle das Formular mit Daten aus der Company-Tabelle, falls vorhanden
          if (company) {
            const updatedFormData = { ...formDataFromProgress };

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
          const initialFormDataWithDirectorsAndContacts = {
            ...initialFormData,
          };

          // Füge die Geschäftsführer hinzu, falls vorhanden
          if (managingDirectorsData.length > 0) {
            initialFormDataWithDirectorsAndContacts.managingDirectors =
              managingDirectorsData;
          }

          // Füge die Lohnabrechnung-Kontakte hinzu, falls vorhanden
          if (payrollContactsData.length > 0) {
            initialFormDataWithDirectorsAndContacts.payrollInfo.payroll_contacts =
              payrollContactsData;
          }

          const newData = await createOnboardingEntry(
            company.id,
            initialFormDataWithDirectorsAndContacts,
          );

          if (newData) {
            setOnboardingId(newData.id);

            // Fülle das Formular mit Daten aus der Company-Tabelle, falls vorhanden
            if (company) {
              const updatedFormData = {
                ...initialFormDataWithDirectorsAndContacts,
              };

              // Unternehmensinformationen
              updatedFormData.companyInfo.name = company.name || "";

              setFormData(updatedFormData);
            } else {
              setFormData(initialFormDataWithDirectorsAndContacts);
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

    fetchOnboardingProgress();
  }, [company, isCompanyLoading]);

  // Aktualisiere die Formulardaten für einen bestimmten Schritt
  const updateFormData = <K extends keyof OnboardingFormData>(
    step: K,
    data: Partial<OnboardingFormData[K]>,
  ) => {
    setFormData((prev) => {
      // Wenn die Daten ein Array sind (wie bei managingDirectors), ersetze das gesamte Array
      if (Array.isArray(data)) {
        console.log(`Updating ${String(step)} with array data:`, data);
        return {
          ...prev,
          [step]: data,
        };
      }

      // Ansonsten führe die Daten zusammen (für Objekte)
      return {
        ...prev,
        [step]: {
          ...prev[step],
          ...data,
        },
      };
    });
  };

  // Speichere den Fortschritt
  const saveProgress = async () => {
    if (!company || !onboardingId || isCompanyLoading) return;

    console.log("Starting saveProgress with formData:", formData);
    console.log("Managing directors before save:", formData.managingDirectors);

    setIsSaving(true);
    try {
      // Aktualisiere den Onboarding-Fortschritt
      await updateOnboardingProgress(onboardingId, currentStep, formData);

      // Aktualisiere die Company-Tabelle mit den relevanten Daten
      await updateCompanyData(company.id, formData, currentStep);

      // Speichere die Geschäftsführer, wenn sie vorhanden sind
      if (formData.managingDirectors.length > 0) {
        console.log("Saving managing directors:", formData.managingDirectors);
        await saveManagingDirectors(company.id, formData.managingDirectors);
      }

      // Speichere die Lohnabrechnung-Kontakte, wenn sie vorhanden sind
      if (formData.payrollInfo.payroll_contacts.length > 0) {
        console.log(
          "Saving payroll contacts:",
          formData.payrollInfo.payroll_contacts,
        );
        await savePayrollContacts(
          company.id,
          formData.payrollInfo.payroll_contacts,
        );
      }
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
      // Speichere zuerst den aktuellen Fortschritt
      await saveProgress();

      // Speichere die Geschäftsführer
      if (formData.managingDirectors.length > 0) {
        console.log(
          "Completing onboarding - Saving managing directors:",
          formData.managingDirectors,
        );
        await saveManagingDirectors(company.id, formData.managingDirectors);
      }

      // Speichere die Lohnabrechnung-Kontakte
      if (formData.payrollInfo.payroll_contacts.length > 0) {
        console.log(
          "Completing onboarding - Saving payroll contacts:",
          formData.payrollInfo.payroll_contacts,
        );
        await savePayrollContacts(
          company.id,
          formData.payrollInfo.payroll_contacts,
        );
      }

      // Aktualisiere den Onboarding-Status in der Company-Tabelle
      await completeOnboardingProcess(company.id);

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
      // Speichere den Fortschritt auch beim Zurückgehen
      saveProgress();
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
