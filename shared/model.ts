import { z } from "zod";

// Define available roles as const
export const Roles = {
  ADMIN: "Admin",
  KUNDENBETREUER: "Kundenbetreuer",
  USER: "User",
} as const;

export const Vertriebspartner = {
  LOHNLAB: "lohnlab",
  LOHNKONZEPTE: "lohnkonzepte",
} as const;

export const PayrollProcessing = {
  INTERNAL: "internal",
  EXTERNAL: "external",
} as const;

export const PayrollSystems = {
  DATEV: "datev",
  LEXWARE: "lexware",
  SAGE: "sage",
  LOHN_AG: "lohn_ag",
  ADDISON: "addison",
  OTHER: "other",
} as const;

// New enums for subsidiary extensions
export const CollectiveAgreementTypes = {
  COMPANY_AGREEMENT: "company_agreement",
  INDUSTRY_AGREEMENT: "industry_agreement",
} as const;

export const GivveCardDesignTypes = {
  STANDARD_CARD: "standard_card",
  LOGO_CARD: "logo_card",
  DESIGN_CARD: "design_card",
} as const;

export const GivveLoadingDates = {
  DAY_10: "10",
  DAY_15: "15",
  DAY_30: "30",
} as const;

export const GivveIndustryCategories = {
  AGRICULTURE_FORESTRY_FISHING: "agriculture_forestry_fishing",
  MANUFACTURING: "manufacturing",
  ENERGY_SUPPLY: "energy_supply",
  WATER_WASTE_MANAGEMENT: "water_waste_management",
  MINING_QUARRYING: "mining_quarrying",
  CONSTRUCTION: "construction",
  TRADE_VEHICLE_REPAIR: "trade_vehicle_repair",
  REAL_ESTATE: "real_estate",
  TRANSPORTATION_STORAGE: "transportation_storage",
  HOSPITALITY: "hospitality",
  INFORMATION_COMMUNICATION: "information_communication",
  FINANCIAL_INSURANCE: "financial_insurance",
  OTHER_BUSINESS_SERVICES: "other_business_services",
  PROFESSIONAL_SCIENTIFIC_TECHNICAL: "professional_scientific_technical",
  PUBLIC_ADMINISTRATION: "public_administration",
  EDUCATION: "education",
  PRIVATE_HOUSEHOLDS: "private_households",
  HEALTH_SOCIAL_SERVICES: "health_social_services",
  ARTS_ENTERTAINMENT: "arts_entertainment",
  OTHER_SERVICES: "other_services",
  EXTRATERRITORIAL_ORGANIZATIONS: "extraterritorial_organizations",
} as const;

export const GermanStates = {
  BADEN_WUERTTEMBERG: "baden_wuerttemberg",
  BAYERN: "bayern",
  BERLIN: "berlin",
  BRANDENBURG: "brandenburg",
  BREMEN: "bremen",
  HAMBURG: "hamburg",
  HESSEN: "hessen",
  MECKLENBURG_VORPOMMERN: "mecklenburg_vorpommern",
  NIEDERSACHSEN: "niedersachsen",
  NORDRHEIN_WESTFALEN: "nordrhein_westfalen",
  RHEINLAND_PFALZ: "rheinland_pfalz",
  SAARLAND: "saarland",
  SACHSEN: "sachsen",
  SACHSEN_ANHALT: "sachsen_anhalt",
  SCHLESWIG_HOLSTEIN: "schleswig_holstein",
  THUERINGEN: "thueringen",
} as const;

export const OwnershipPercentage = {
  MORE_THAN_25: "more_than_25",
  LESS_THAN_25: "less_than_25",
} as const;

export type RoleType = (typeof Roles)[keyof typeof Roles];

// Forward declarations to handle circular references
type CompanySchemaType = z.ZodObject<{
  id: z.ZodString;
  name: z.ZodString;
  vertriebspartner: z.ZodEnum<
    [typeof Vertriebspartner.LOHNLAB, typeof Vertriebspartner.LOHNKONZEPTE]
  >;
  created_at: z.ZodDate;
  // Relations
  subsidiaries: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
  company_users: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
}>;

type CompanyUserSchemaType = z.ZodObject<{
  user_id: z.ZodString;
  company_id: z.ZodString;
  role: z.ZodEnum<[typeof Roles.KUNDENBETREUER, typeof Roles.USER]>;
  created_at: z.ZodDate;
  company: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
  user: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

type EmployeeSchemaType = z.ZodObject<{
  id: z.ZodString;
  subsidiary_id: z.ZodString;
  firstname: z.ZodString;
  lastname: z.ZodString;
  created_at: z.ZodDate;
  subsidiary: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

type PermissionSchemaType = z.ZodObject<{
  id: z.ZodString;
  role_id: z.ZodString;
  feature: z.ZodString;
  can_access: z.ZodBoolean;
  role: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

type RoleSchemaType = z.ZodObject<{
  id: z.ZodString;
  name: z.ZodEnum<
    [typeof Roles.ADMIN, typeof Roles.KUNDENBETREUER, typeof Roles.USER]
  >;
  permissions: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
}>;

type SubsidiarySchemaType = z.ZodObject<{
  id: z.ZodString;
  company_id: z.ZodString;
  name: z.ZodString;
  legal_form: z.ZodString;
  created_at: z.ZodDate;
  // Onboarding fields
  tax_number: z.ZodOptional<z.ZodString>;
  logo_url: z.ZodOptional<z.ZodString>;
  street: z.ZodOptional<z.ZodString>;
  house_number: z.ZodOptional<z.ZodString>;
  postal_code: z.ZodOptional<z.ZodString>;
  city: z.ZodOptional<z.ZodString>;
  commercial_register: z.ZodOptional<z.ZodString>;
  commercial_register_number: z.ZodOptional<z.ZodString>;
  commercial_register_file_url: z.ZodOptional<z.ZodString>;
  payroll_processing: z.ZodOptional<
    z.ZodEnum<
      [typeof PayrollProcessing.INTERNAL, typeof PayrollProcessing.EXTERNAL]
    >
  >;
  payroll_system: z.ZodOptional<
    z.ZodEnum<
      [
        typeof PayrollSystems.DATEV,
        typeof PayrollSystems.LEXWARE,
        typeof PayrollSystems.SAGE,
        typeof PayrollSystems.LOHN_AG,
        typeof PayrollSystems.ADDISON,
        typeof PayrollSystems.OTHER,
      ]
    >
  >;
  onboarding_completed: z.ZodOptional<z.ZodBoolean>;
  onboarding_step: z.ZodOptional<z.ZodNumber>;
  // Works council (Betriebsrat)
  has_works_council: z.ZodOptional<z.ZodBoolean>;
  // Collective bargaining agreement (Tarifbindung)
  has_collective_agreement: z.ZodOptional<z.ZodBoolean>;
  collective_agreement_type: z.ZodOptional<
    z.ZodEnum<
      [
        typeof CollectiveAgreementTypes.COMPANY_AGREEMENT,
        typeof CollectiveAgreementTypes.INDUSTRY_AGREEMENT,
      ]
    >
  >;
  collective_agreement_document_url: z.ZodOptional<z.ZodString>;
  // Givve Card related fields
  has_givve_card: z.ZodBoolean;
  givve_legal_form: z.ZodOptional<z.ZodString>;
  givve_card_design_type: z.ZodOptional<
    z.ZodEnum<
      [
        typeof GivveCardDesignTypes.STANDARD_CARD,
        typeof GivveCardDesignTypes.LOGO_CARD,
        typeof GivveCardDesignTypes.DESIGN_CARD,
      ]
    >
  >;
  givve_company_logo_url: z.ZodOptional<z.ZodString>;
  givve_card_design_url: z.ZodOptional<z.ZodString>;
  givve_standard_postal_code: z.ZodOptional<z.ZodString>;
  givve_card_second_line: z.ZodOptional<z.ZodString>;
  givve_loading_date: z.ZodOptional<z.ZodString>;
  givve_industry_category: z.ZodOptional<z.ZodString>;
  // Givve Onboarding fields
  givve_onboarding_step: z.ZodOptional<z.ZodNumber>;
  givve_onboarding_completed: z.ZodOptional<z.ZodBoolean>;
  givve_video_identification_link: z.ZodOptional<z.ZodString>;
  givve_order_forms_downloaded: z.ZodOptional<z.ZodBoolean>;
  givve_documentation_forms_downloaded: z.ZodOptional<z.ZodBoolean>;
  givve_legal_documents_bucket_path: z.ZodOptional<z.ZodString>;
  givve_onboarding_status: z.ZodOptional<z.ZodString>;
  // Import file preferences
  wants_import_file: z.ZodOptional<z.ZodBoolean>;
  import_date_type: z.ZodOptional<z.ZodEnum<["standard", "custom"]>>;
  custom_import_date: z.ZodOptional<z.ZodString>;
  // Headquarters information (Hauptniederlassung)
  headquarters_street: z.ZodOptional<z.ZodString>;
  headquarters_house_number: z.ZodOptional<z.ZodString>;
  headquarters_postal_code: z.ZodOptional<z.ZodString>;
  headquarters_city: z.ZodOptional<z.ZodString>;
  headquarters_state: z.ZodOptional<
    z.ZodEnum<
      [
        typeof GermanStates.BADEN_WUERTTEMBERG,
        typeof GermanStates.BAYERN,
        typeof GermanStates.BERLIN,
        typeof GermanStates.BRANDENBURG,
        typeof GermanStates.BREMEN,
        typeof GermanStates.HAMBURG,
        typeof GermanStates.HESSEN,
        typeof GermanStates.MECKLENBURG_VORPOMMERN,
        typeof GermanStates.NIEDERSACHSEN,
        typeof GermanStates.NORDRHEIN_WESTFALEN,
        typeof GermanStates.RHEINLAND_PFALZ,
        typeof GermanStates.SAARLAND,
        typeof GermanStates.SACHSEN,
        typeof GermanStates.SACHSEN_ANHALT,
        typeof GermanStates.SCHLESWIG_HOLSTEIN,
        typeof GermanStates.THUERINGEN,
      ]
    >
  >;
  headquarters_name: z.ZodOptional<z.ZodString>;
  has_canteen: z.ZodOptional<z.ZodBoolean>;
  has_ev_charging: z.ZodOptional<z.ZodBoolean>;
  // Relations
  company: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
  employees: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
  managing_directors: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
  payroll_contacts: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
  onboarding_progress: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
  beneficial_owners: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
  givve_onboarding_progress: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

type UserProfileSchemaType = z.ZodObject<{
  id: z.ZodString;
  firstname: z.ZodString;
  lastname: z.ZodString;
  email: z.ZodString;
  role: z.ZodEnum<
    [typeof Roles.ADMIN, typeof Roles.KUNDENBETREUER, typeof Roles.USER]
  >;
  created_at: z.ZodDate;
  company_users: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
}>;

type AnsprechpartnerSchemaType = z.ZodObject<{
  id: z.ZodString;
  company_id: z.ZodString;
  firstname: z.ZodString;
  lastname: z.ZodString;
  email: z.ZodString;
  phone: z.ZodOptional<z.ZodString>;
  category: z.ZodOptional<z.ZodString>;
  categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
  company_name: z.ZodOptional<z.ZodString>;
  has_cockpit_access: z.ZodOptional<z.ZodBoolean>;
  created_at: z.ZodOptional<z.ZodDate>;
}>;

type ManagingDirectorSchemaType = z.ZodObject<{
  id: z.ZodString;
  subsidiary_id: z.ZodString;
  firstname: z.ZodString;
  lastname: z.ZodString;
  email: z.ZodOptional<z.ZodString>;
  phone: z.ZodOptional<z.ZodString>;
  created_at: z.ZodDate;
  subsidiary: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

type PayrollContactSchemaType = z.ZodObject<{
  id: z.ZodString;
  subsidiary_id: z.ZodString;
  firstname: z.ZodString;
  lastname: z.ZodString;
  email: z.ZodString;
  phone: z.ZodOptional<z.ZodString>;
  company_name: z.ZodOptional<z.ZodString>;
  created_at: z.ZodDate;
  subsidiary: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

type OnboardingProgressSchemaType = z.ZodObject<{
  id: z.ZodString;
  subsidiary_id: z.ZodString;
  current_step: z.ZodNumber;
  form_data: z.ZodRecord<z.ZodString, z.ZodAny>;
  last_updated: z.ZodDate;
  created_at: z.ZodDate;
  subsidiary: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

type BeneficialOwnerSchemaType = z.ZodObject<{
  id: z.ZodString;
  subsidiary_id: z.ZodString;
  firstname: z.ZodString;
  lastname: z.ZodString;
  birth_date: z.ZodDate;
  nationality: z.ZodString;
  ownership_percentage: z.ZodEnum<
    [
      typeof OwnershipPercentage.MORE_THAN_25,
      typeof OwnershipPercentage.LESS_THAN_25,
    ]
  >;
  has_public_office: z.ZodBoolean;
  public_office_description: z.ZodOptional<z.ZodString>;
  created_at: z.ZodDate;
  subsidiary: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

// Define GivveOnboardingProgress schema type
type GivveOnboardingProgressSchemaType = z.ZodObject<{
  id: z.ZodString;
  subsidiary_id: z.ZodString;
  current_step: z.ZodNumber;
  form_data: z.ZodRecord<z.ZodString, z.ZodAny>;
  last_updated: z.ZodDate;
  created_at: z.ZodDate;
  completed: z.ZodBoolean;
  status: z.ZodOptional<z.ZodString>;
  subsidiary: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

export const companySchema: CompanySchemaType = z.object({
  id: z.string().uuid(),
  name: z.string(),
  vertriebspartner: z.enum([
    Vertriebspartner.LOHNLAB,
    Vertriebspartner.LOHNKONZEPTE,
  ]),
  created_at: z.date(),
  // Relations
  subsidiaries: z.array(z.lazy(() => subsidiarySchema)).optional(),
  company_users: z.array(z.lazy(() => companyUserSchema)).optional(),
});

export const companyUserSchema: CompanyUserSchemaType = z.object({
  user_id: z.string().uuid(),
  company_id: z.string().uuid(),
  role: z.enum([Roles.KUNDENBETREUER, Roles.USER]),
  created_at: z.date(),
  company: z.lazy(() => companySchema).optional(),
  user: z.lazy(() => userProfileSchema).optional(),
});

export const employeeSchema: EmployeeSchemaType = z.object({
  id: z.string().uuid(),
  subsidiary_id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  created_at: z.date(),
  subsidiary: z.lazy(() => subsidiarySchema).optional(),
});

export const permissionSchema: PermissionSchemaType = z.object({
  id: z.string().uuid(),
  role_id: z.string().uuid(),
  feature: z.string(),
  can_access: z.boolean(),
  role: z.lazy(() => roleSchema).optional(),
});

export const roleSchema: RoleSchemaType = z.object({
  id: z.string().uuid(),
  name: z.enum([Roles.ADMIN, Roles.KUNDENBETREUER, Roles.USER]),
  permissions: z.array(z.lazy(() => permissionSchema)).optional(),
});

export const subsidiarySchema: SubsidiarySchemaType = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  name: z.string(),
  legal_form: z.string(),
  created_at: z.date(),
  // Onboarding fields
  tax_number: z.string().optional(),
  logo_url: z.string().optional(),
  street: z.string().optional(),
  house_number: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  commercial_register: z.string().optional(),
  commercial_register_number: z.string().optional(),
  commercial_register_file_url: z.string().optional(),
  payroll_processing: z
    .enum([PayrollProcessing.INTERNAL, PayrollProcessing.EXTERNAL])
    .optional(),
  payroll_system: z
    .enum([
      PayrollSystems.DATEV,
      PayrollSystems.LEXWARE,
      PayrollSystems.SAGE,
      PayrollSystems.LOHN_AG,
      PayrollSystems.ADDISON,
      PayrollSystems.OTHER,
    ])
    .optional(),
  onboarding_completed: z.boolean().optional(),
  onboarding_step: z.number().optional(),
  // Works council (Betriebsrat)
  has_works_council: z.boolean().optional(),
  // Collective bargaining agreement (Tarifbindung)
  has_collective_agreement: z.boolean().optional(),
  collective_agreement_type: z
    .enum([
      CollectiveAgreementTypes.COMPANY_AGREEMENT,
      CollectiveAgreementTypes.INDUSTRY_AGREEMENT,
    ])
    .optional(),
  collective_agreement_document_url: z.string().optional(),
  // Givve Card related fields
  has_givve_card: z.boolean(),
  givve_legal_form: z.string().optional(),
  givve_card_design_type: z
    .enum([
      GivveCardDesignTypes.STANDARD_CARD,
      GivveCardDesignTypes.LOGO_CARD,
      GivveCardDesignTypes.DESIGN_CARD,
    ])
    .optional(),
  givve_company_logo_url: z.string().optional(),
  givve_card_design_url: z.string().optional(),
  givve_standard_postal_code: z.string().optional(),
  givve_card_second_line: z.string().optional(),
  givve_loading_date: z.string().optional(),
  givve_industry_category: z.string().optional(),
  // Givve Onboarding fields
  givve_onboarding_step: z.number().optional(),
  givve_onboarding_completed: z.boolean().optional(),
  givve_video_identification_link: z.string().optional(),
  givve_order_forms_downloaded: z.boolean().optional(),
  givve_documentation_forms_downloaded: z.boolean().optional(),
  givve_legal_documents_bucket_path: z.string().optional(),
  givve_onboarding_status: z.string().optional(),
  // Import file preferences
  wants_import_file: z.boolean().optional(),
  import_date_type: z.enum(["standard", "custom"]).optional(),
  custom_import_date: z.string().optional(),
  // Headquarters information (Hauptniederlassung)
  headquarters_street: z.string().optional(),
  headquarters_house_number: z.string().optional(),
  headquarters_postal_code: z.string().optional(),
  headquarters_city: z.string().optional(),
  headquarters_state: z
    .enum([
      GermanStates.BADEN_WUERTTEMBERG,
      GermanStates.BAYERN,
      GermanStates.BERLIN,
      GermanStates.BRANDENBURG,
      GermanStates.BREMEN,
      GermanStates.HAMBURG,
      GermanStates.HESSEN,
      GermanStates.MECKLENBURG_VORPOMMERN,
      GermanStates.NIEDERSACHSEN,
      GermanStates.NORDRHEIN_WESTFALEN,
      GermanStates.RHEINLAND_PFALZ,
      GermanStates.SAARLAND,
      GermanStates.SACHSEN,
      GermanStates.SACHSEN_ANHALT,
      GermanStates.SCHLESWIG_HOLSTEIN,
      GermanStates.THUERINGEN,
    ])
    .optional(),
  headquarters_name: z.string().optional(),
  has_canteen: z.boolean().optional(),
  has_ev_charging: z.boolean().optional(),
  // Relations
  company: z.lazy(() => companySchema).optional(),
  employees: z.array(z.lazy(() => employeeSchema)).optional(),
  managing_directors: z.array(z.lazy(() => managingDirectorSchema)).optional(),
  payroll_contacts: z.array(z.lazy(() => payrollContactSchema)).optional(),
  onboarding_progress: z.lazy(() => onboardingProgressSchema).optional(),
  beneficial_owners: z.array(z.lazy(() => beneficialOwnerSchema)).optional(),
  givve_onboarding_progress: z
    .lazy(() => givveOnboardingProgressSchema)
    .optional(),
});

export const userProfileSchema: UserProfileSchemaType = z.object({
  id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  role: z.enum([Roles.ADMIN, Roles.KUNDENBETREUER, Roles.USER]),
  created_at: z.date(),
  company_users: z.array(z.lazy(() => companyUserSchema)).optional(),
});

export const ansprechpartnerSchema: AnsprechpartnerSchemaType = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  category: z.string().optional(),
  categories: z.array(z.string()).optional(),
  company_name: z.string().optional(),
  has_cockpit_access: z.boolean().optional(),
  created_at: z.date().optional(),
});

export const managingDirectorSchema: ManagingDirectorSchemaType = z.object({
  id: z.string().uuid(),
  subsidiary_id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  created_at: z.date(),
  subsidiary: z.lazy(() => subsidiarySchema).optional(),
});

export const payrollContactSchema: PayrollContactSchemaType = z.object({
  id: z.string().uuid(),
  subsidiary_id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  created_at: z.date(),
  subsidiary: z.lazy(() => subsidiarySchema).optional(),
});

export const onboardingProgressSchema: OnboardingProgressSchemaType = z.object({
  id: z.string().uuid(),
  subsidiary_id: z.string().uuid(),
  current_step: z.number(),
  form_data: z.record(z.string(), z.any()),
  last_updated: z.date(),
  created_at: z.date(),
  subsidiary: z.lazy(() => subsidiarySchema).optional(),
});

export const beneficialOwnerSchema: BeneficialOwnerSchemaType = z.object({
  id: z.string().uuid(),
  subsidiary_id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  birth_date: z.date(),
  nationality: z.string(),
  ownership_percentage: z.enum([
    OwnershipPercentage.MORE_THAN_25,
    OwnershipPercentage.LESS_THAN_25,
  ]),
  has_public_office: z.boolean(),
  public_office_description: z.string().optional(),
  created_at: z.date(),
  subsidiary: z.lazy(() => subsidiarySchema).optional(),
});

// Add the GivveOnboardingProgress schema
export const givveOnboardingProgressSchema: GivveOnboardingProgressSchemaType =
  z.object({
    id: z.string().uuid(),
    subsidiary_id: z.string().uuid(),
    current_step: z.number(),
    form_data: z.record(z.string(), z.any()),
    last_updated: z.date(),
    created_at: z.date(),
    completed: z.boolean(),
    status: z.string().optional(),
    subsidiary: z.lazy(() => subsidiarySchema).optional(),
  });

// Inferred Types
export type Company = z.infer<typeof companySchema>;
export type CompanyUser = z.infer<typeof companyUserSchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type Permission = z.infer<typeof permissionSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Subsidiary = z.infer<typeof subsidiarySchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type Ansprechpartner = z.infer<typeof ansprechpartnerSchema>;
export type ManagingDirector = z.infer<typeof managingDirectorSchema>;
export type PayrollContact = z.infer<typeof payrollContactSchema>;
export type OnboardingProgress = z.infer<typeof onboardingProgressSchema>;
export type BeneficialOwner = z.infer<typeof beneficialOwnerSchema>;
