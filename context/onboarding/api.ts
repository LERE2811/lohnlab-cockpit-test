import { supabase } from "@/utils/supabase/client";
import { OnboardingFormData, OnboardingStep } from "./types";
import { Company, ManagingDirector, PayrollContact } from "@/shared/model";

/**
 * Loads the onboarding progress for a company
 */
export const loadOnboardingData = async (companyId: string) => {
  // Lade Geschäftsführer aus der Datenbank
  const { data: managingDirectorsData, error: managingDirectorsError } =
    await supabase
      .from("managing_directors")
      .select("*")
      .eq("company_id", companyId);

  if (managingDirectorsError) throw managingDirectorsError;

  // Lade Lohnabrechnung-Kontakte aus der Datenbank
  const { data: payrollContactsData, error: payrollContactsError } =
    await supabase
      .from("payroll_contacts")
      .select("*")
      .eq("company_id", companyId);

  if (payrollContactsError) throw payrollContactsError;

  // Prüfe, ob bereits ein Onboarding-Eintrag existiert
  const { data, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return {
    onboardingData: data,
    managingDirectorsData,
    payrollContactsData,
  };
};

/**
 * Creates a new onboarding progress entry
 */
export const createOnboardingEntry = async (
  companyId: string,
  formData: OnboardingFormData,
) => {
  const { data, error } = await supabase
    .from("onboarding_progress")
    .insert({
      company_id: companyId,
      current_step: OnboardingStep.COMPANY_INFO,
      form_data: formData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Updates the onboarding progress
 */
export const updateOnboardingProgress = async (
  onboardingId: string,
  currentStep: OnboardingStep,
  formData: OnboardingFormData,
) => {
  const { error } = await supabase
    .from("onboarding_progress")
    .update({
      current_step: currentStep,
      form_data: formData,
      last_updated: new Date().toISOString(),
    })
    .eq("id", onboardingId);

  if (error) throw error;
};

/**
 * Updates the company data based on the onboarding form data
 */
export const updateCompanyData = async (
  companyId: string,
  formData: OnboardingFormData,
  currentStep: OnboardingStep,
) => {
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
    companyUpdateData.payroll_system = formData.payrollInfo.payroll_system as
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
  const { error } = await supabase
    .from("companies")
    .update(companyUpdateData)
    .eq("id", companyId);

  if (error) throw error;
};

/**
 * Saves managing directors to the database
 */
export const saveManagingDirectors = async (
  companyId: string,
  directors: ManagingDirector[],
) => {
  if (directors.length === 0) return;

  // Lösche zuerst alle vorhandenen Geschäftsführer
  const { error: deleteError } = await supabase
    .from("managing_directors")
    .delete()
    .eq("company_id", companyId);

  if (deleteError) throw deleteError;

  // Füge die neuen Geschäftsführer hinzu
  const managingDirectorsToInsert = directors.map((director) => ({
    company_id: companyId,
    firstname: director.firstname,
    lastname: director.lastname,
    // Konvertiere leere Strings zu null für optionale Felder
    email:
      director.email && director.email.trim() !== "" ? director.email : null,
    phone:
      director.phone && director.phone.trim() !== "" ? director.phone : null,
  }));

  const { data, error: insertError } = await supabase
    .from("managing_directors")
    .insert(managingDirectorsToInsert)
    .select();

  if (insertError) throw insertError;

  return data;
};

/**
 * Saves payroll contacts to the database
 */
export const savePayrollContacts = async (
  companyId: string,
  contacts: PayrollContact[],
) => {
  if (contacts.length === 0) return;

  // Lösche zuerst alle vorhandenen Lohnabrechnung-Kontakte
  const { error: deleteError } = await supabase
    .from("payroll_contacts")
    .delete()
    .eq("company_id", companyId);

  if (deleteError) throw deleteError;

  // Füge die neuen Lohnabrechnung-Kontakte hinzu
  const payrollContactsToInsert = contacts.map((contact) => ({
    company_id: companyId,
    firstname: contact.firstname,
    lastname: contact.lastname,
    // Konvertiere leere Strings zu null für optionale Felder
    email: contact.email && contact.email.trim() !== "" ? contact.email : null,
    phone: contact.phone && contact.phone.trim() !== "" ? contact.phone : null,
  }));

  const { data, error: insertError } = await supabase
    .from("payroll_contacts")
    .insert(payrollContactsToInsert)
    .select();

  if (insertError) throw insertError;

  return data;
};

/**
 * Completes the onboarding process
 */
export const completeOnboardingProcess = async (companyId: string) => {
  const { error } = await supabase
    .from("companies")
    .update({
      onboarding_completed: true,
      onboarding_step: OnboardingStep.COMPLETED,
    })
    .eq("id", companyId);

  if (error) throw error;
};
