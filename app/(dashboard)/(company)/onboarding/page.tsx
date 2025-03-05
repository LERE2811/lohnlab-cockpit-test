"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  OnboardingProvider,
  useOnboarding,
  OnboardingStep,
} from "@/context/onboarding-context";
import { useCompany } from "@/context/company-context";
import { useUser } from "@/context/user-context";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";
import CompanyInfoStep from "./steps/CompanyInfoStep";
import AddressStep from "./steps/AddressStep";
import CommercialRegisterStep from "./steps/CommercialRegisterStep";
import ManagingDirectorsStep from "./steps/ManagingDirectorsStep";
import PayrollInfoStep from "./steps/PayrollStep";
import ReviewStep from "./steps/ReviewStep";
import CompletedStep from "./steps/CompletedStep";
import { useState } from "react";

// Wrapper-Komponente für den Onboarding-Inhalt
function OnboardingContent() {
  const {
    currentStep,
    isLoading: isOnboardingLoading,
    isSaving,
    progress,
    goToNextStep,
    goToPreviousStep,
    saveProgress,
    completeOnboarding,
    formData,
  } = useOnboarding();
  const { company, isLoading: isCompanyLoading } = useCompany();
  const router = useRouter();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Wenn kein Unternehmen ausgewählt ist, zurück zum Dashboard
  // Aber nur, wenn das Laden der Unternehmensdaten abgeschlossen ist
  useEffect(() => {
    if (!isCompanyLoading && company === null) {
      router.push("/dashboard");
    }
  }, [company, isCompanyLoading, router]);

  // Wenn das Onboarding bereits abgeschlossen ist, zum Dashboard weiterleiten
  // Aber nur, wenn das Laden der Unternehmensdaten abgeschlossen ist
  useEffect(() => {
    if (!isCompanyLoading && company?.onboarding_completed) {
      router.push("/dashboard");
    }
  }, [company, isCompanyLoading, router]);

  // Validierungsfunktionen für jeden Schritt
  const validateCompanyInfo = () => {
    const { name, tax_number } = formData.companyInfo;
    return !!name && !!tax_number;
  };

  const validateAddress = () => {
    const { street, house_number, postal_code, city } = formData.address;
    return !!street && !!house_number && !!postal_code && !!city;
  };

  const validateCommercialRegister = () => {
    const { commercial_register, commercial_register_number } =
      formData.commercialRegister;
    return !!commercial_register && !!commercial_register_number;
  };

  const validateManagingDirectors = () => {
    return (
      formData.managingDirectors.length > 0 &&
      formData.managingDirectors.every(
        (director) => !!director.firstname && !!director.lastname,
      )
    );
  };

  const validatePayrollInfo = () => {
    const { payroll_processing, payroll_system, payroll_contacts } =
      formData.payrollInfo;

    const hasValidContacts =
      payroll_contacts.length > 0 &&
      payroll_contacts.every(
        (contact) =>
          !!contact.firstname && !!contact.lastname && !!contact.email,
      );

    return !!payroll_processing && !!payroll_system && hasValidContacts;
  };

  // Prüfe, ob alle Schritte vollständig sind
  const allStepsComplete = () => {
    return (
      validateCompanyInfo() &&
      validateAddress() &&
      validateCommercialRegister() &&
      validateManagingDirectors() &&
      validatePayrollInfo()
    );
  };

  // Handler für das Abschließen des Onboardings mit Validierung
  const handleCompleteOnboarding = () => {
    if (!allStepsComplete()) {
      setValidationError(
        "Bitte füllen Sie alle erforderlichen Felder aus, bevor Sie das Onboarding abschließen.",
      );
      return;
    }

    setValidationError(null);
    completeOnboarding();
  };

  // Zeige Ladeindikator, wenn entweder Unternehmensdaten oder Onboarding-Daten geladen werden
  if (isCompanyLoading || isOnboardingLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Lade Daten...</span>
      </div>
    );
  }

  // Rendere den aktuellen Schritt
  const renderStep = () => {
    switch (currentStep) {
      case OnboardingStep.COMPANY_INFO:
        return <CompanyInfoStep />;
      case OnboardingStep.ADDRESS:
        return <AddressStep />;
      case OnboardingStep.COMMERCIAL_REGISTER:
        return <CommercialRegisterStep />;
      case OnboardingStep.MANAGING_DIRECTORS:
        return <ManagingDirectorsStep />;
      case OnboardingStep.PAYROLL_INFO:
        return <PayrollInfoStep />;
      case OnboardingStep.REVIEW:
        return <ReviewStep />;
      case OnboardingStep.COMPLETED:
        return <CompletedStep />;
      default:
        return <CompanyInfoStep />;
    }
  };

  // Bestimme den Titel des aktuellen Schritts
  const getStepTitle = () => {
    switch (currentStep) {
      case OnboardingStep.COMPANY_INFO:
        return "Unternehmensinformationen";
      case OnboardingStep.ADDRESS:
        return "Adresse";
      case OnboardingStep.COMMERCIAL_REGISTER:
        return "Handelsregister";
      case OnboardingStep.MANAGING_DIRECTORS:
        return "Geschäftsführer";
      case OnboardingStep.PAYROLL_INFO:
        return "Lohnabrechnung";
      case OnboardingStep.REVIEW:
        return "Überprüfung";
      case OnboardingStep.COMPLETED:
        return "Abgeschlossen";
      default:
        return "Onboarding";
    }
  };

  // Bestimme die Beschreibung des aktuellen Schritts
  const getStepDescription = () => {
    switch (currentStep) {
      case OnboardingStep.COMPANY_INFO:
        return "Bitte geben Sie grundlegende Informationen zu Ihrem Unternehmen ein.";
      case OnboardingStep.ADDRESS:
        return "Bitte geben Sie die Adresse Ihres Unternehmens ein.";
      case OnboardingStep.COMMERCIAL_REGISTER:
        return "Bitte geben Sie Informationen zum Handelsregister ein.";
      case OnboardingStep.MANAGING_DIRECTORS:
        return "Bitte fügen Sie die Geschäftsführer Ihres Unternehmens hinzu.";
      case OnboardingStep.PAYROLL_INFO:
        return "Bitte geben Sie Informationen zur Lohnabrechnung ein.";
      case OnboardingStep.REVIEW:
        return "Bitte überprüfen Sie alle eingegebenen Informationen.";
      case OnboardingStep.COMPLETED:
        return "Das Onboarding wurde erfolgreich abgeschlossen.";
      default:
        return "Bitte füllen Sie alle erforderlichen Informationen aus.";
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{getStepTitle()}</h1>
        <p className="mt-2 text-muted-foreground">{getStepDescription()}</p>
      </div>

      {/* Fortschrittsanzeige */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>
            Schritt {currentStep} von {OnboardingStep.COMPLETED - 1}
          </span>
          <span>{progress}% abgeschlossen</span>
        </div>
      </div>

      {/* Aktueller Schritt */}
      <div className="mb-8 rounded-lg border p-6 shadow-sm">{renderStep()}</div>

      {/* Validierungsfehler */}
      {validationError && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
          <div className="flex">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === OnboardingStep.COMPANY_INFO || isSaving}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={saveProgress} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              "Speichern"
            )}
          </Button>

          {currentStep < OnboardingStep.REVIEW ? (
            <Button onClick={goToNextStep} disabled={isSaving}>
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : currentStep === OnboardingStep.REVIEW ? (
            <Button
              onClick={handleCompleteOnboarding}
              disabled={isSaving || !allStepsComplete()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Abschließen...
                </>
              ) : (
                <>
                  Onboarding abschließen
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => router.push("/dashboard")}>
              Zum Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hauptkomponente mit Provider
export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}
