-- Migration to add company name field to payroll_contacts table for external payroll providers

-- Add company name field to payroll_contacts table
ALTER TABLE "public"."payroll_contacts" 
ADD COLUMN IF NOT EXISTS "company_name" TEXT; 