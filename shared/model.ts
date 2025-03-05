import { z } from "zod";

// Define available roles as const
export const Roles = {
  ADMIN: "Admin",
  KUNDENBETREUER: "Kundenbetreuer",
  USER: "User",
} as const;

export const Vertriebspartner = {
  LOHNLAB: "Lohnlab",
  LOHNKONZEPT: "Lohnkonzepte",
} as const;

export const PayrollProcessing = {
  INTERNAL: "Intern",
  EXTERNAL: "Extern",
} as const;

export const PayrollSystems = {
  DATEV: "DATEV",
  LEXWARE: "Lexware",
  SAGE: "Sage",
  LOHN_AG: "Lohn AG",
  ADDISON: "Addison",
  OTHER: "Andere",
} as const;

export type RoleType = (typeof Roles)[keyof typeof Roles];

// Forward declarations to handle circular references
type CompanySchemaType = z.ZodObject<{
  id: z.ZodString;
  name: z.ZodString;
  vertriebspartner: z.ZodEnum<
    [typeof Vertriebspartner.LOHNLAB, typeof Vertriebspartner.LOHNKONZEPT]
  >;
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
  // Relations
  subsidiaries: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
  company_users: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
  managing_directors: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
  payroll_contacts: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
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
  company: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
  employees: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<any>>>>;
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
}>;

type ManagingDirectorSchemaType = z.ZodObject<{
  id: z.ZodString;
  company_id: z.ZodString;
  firstname: z.ZodString;
  lastname: z.ZodString;
  email: z.ZodOptional<z.ZodString>;
  phone: z.ZodOptional<z.ZodString>;
  created_at: z.ZodDate;
  company: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

type PayrollContactSchemaType = z.ZodObject<{
  id: z.ZodString;
  company_id: z.ZodString;
  firstname: z.ZodString;
  lastname: z.ZodString;
  email: z.ZodString;
  phone: z.ZodOptional<z.ZodString>;
  created_at: z.ZodDate;
  company: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

type OnboardingProgressSchemaType = z.ZodObject<{
  id: z.ZodString;
  company_id: z.ZodString;
  current_step: z.ZodNumber;
  form_data: z.ZodRecord<z.ZodString, z.ZodAny>;
  last_updated: z.ZodDate;
  created_at: z.ZodDate;
  company: z.ZodOptional<z.ZodLazy<z.ZodType<any>>>;
}>;

export const companySchema: CompanySchemaType = z.object({
  id: z.string().uuid(),
  name: z.string(),
  vertriebspartner: z.enum([
    Vertriebspartner.LOHNLAB,
    Vertriebspartner.LOHNKONZEPT,
  ]),
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
  // Relations
  subsidiaries: z.array(z.lazy(() => subsidiarySchema)).optional(),
  company_users: z.array(z.lazy(() => companyUserSchema)).optional(),
  managing_directors: z.array(z.lazy(() => managingDirectorSchema)).optional(),
  payroll_contacts: z.array(z.lazy(() => payrollContactSchema)).optional(),
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
  company: z.lazy(() => companySchema).optional(),
  employees: z.array(z.lazy(() => employeeSchema)).optional(),
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
});

export const managingDirectorSchema: ManagingDirectorSchemaType = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  created_at: z.date(),
  company: z.lazy(() => companySchema).optional(),
});

export const payrollContactSchema: PayrollContactSchemaType = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  created_at: z.date(),
  company: z.lazy(() => companySchema).optional(),
});

export const onboardingProgressSchema: OnboardingProgressSchemaType = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  current_step: z.number(),
  form_data: z.record(z.string(), z.any()),
  last_updated: z.date(),
  created_at: z.date(),
  company: z.lazy(() => companySchema).optional(),
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
