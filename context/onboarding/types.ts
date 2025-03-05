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
export const initialFormData: OnboardingFormData = {
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
export interface OnboardingContextType {
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
