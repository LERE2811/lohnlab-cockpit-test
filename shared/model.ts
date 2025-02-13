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

export type RoleType = (typeof Roles)[keyof typeof Roles];

// Forward declarations to handle circular references
type CompanySchemaType = z.ZodObject<{
  id: z.ZodString;
  name: z.ZodString;
  vertriebspartner: z.ZodString;
  created_at: z.ZodDate;
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
  email: z.ZodString;
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

export const companySchema: CompanySchemaType = z.object({
  id: z.string().uuid(),
  name: z.string(),
  vertriebspartner: z.enum([
    Vertriebspartner.LOHNLAB,
    Vertriebspartner.LOHNKONZEPT,
  ]),
  created_at: z.date(),
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
  email: z.string().email(),
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

// Inferred Types
export type Company = z.infer<typeof companySchema>;
export type CompanyUser = z.infer<typeof companyUserSchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type Permission = z.infer<typeof permissionSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Subsidiary = z.infer<typeof subsidiarySchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
