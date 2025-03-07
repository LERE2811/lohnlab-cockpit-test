-- Migration to add new fields to the subsidiaries table for additional business information

-- Add works council (Betriebsrat) field
ALTER TABLE "public"."subsidiaries" 
ADD COLUMN IF NOT EXISTS "has_works_council" BOOLEAN DEFAULT FALSE;

-- Add collective bargaining agreement (Tarifbindung) fields
ALTER TABLE "public"."subsidiaries" 
ADD COLUMN IF NOT EXISTS "has_collective_agreement" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "collective_agreement_type" TEXT, -- 'company_agreement', 'industry_agreement', or NULL
ADD COLUMN IF NOT EXISTS "collective_agreement_document_url" TEXT; -- URL to uploaded document

-- Add givve Card related fields
ALTER TABLE "public"."subsidiaries" 
ADD COLUMN IF NOT EXISTS "has_givve_card" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "givve_legal_form" TEXT,
ADD COLUMN IF NOT EXISTS "givve_card_design_type" TEXT, -- 'standard_card', 'logo_card', 'design_card'
ADD COLUMN IF NOT EXISTS "givve_company_logo_url" TEXT,
ADD COLUMN IF NOT EXISTS "givve_card_design_url" TEXT,
ADD COLUMN IF NOT EXISTS "givve_standard_postal_code" TEXT,
ADD COLUMN IF NOT EXISTS "givve_card_second_line" TEXT, -- max 21 characters
ADD COLUMN IF NOT EXISTS "givve_loading_date" TEXT, -- '10', '15', or '30'
ADD COLUMN IF NOT EXISTS "givve_industry_category" TEXT;

-- Create table for beneficial owners (wirtschaftlich Berechtigte)
CREATE TABLE IF NOT EXISTS "public"."beneficial_owners" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "subsidiary_id" UUID NOT NULL REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "nationality" TEXT NOT NULL,
    "ownership_percentage" TEXT NOT NULL, -- 'more_than_25', 'less_than_25'
    "has_public_office" BOOLEAN DEFAULT FALSE,
    "public_office_description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add headquarters information (Hauptniederlassung)
ALTER TABLE "public"."subsidiaries" 
ADD COLUMN IF NOT EXISTS "headquarters_street" TEXT,
ADD COLUMN IF NOT EXISTS "headquarters_house_number" TEXT,
ADD COLUMN IF NOT EXISTS "headquarters_postal_code" TEXT,
ADD COLUMN IF NOT EXISTS "headquarters_city" TEXT,
ADD COLUMN IF NOT EXISTS "headquarters_state" TEXT, -- German federal state
ADD COLUMN IF NOT EXISTS "headquarters_name" TEXT, -- Name/designation of the headquarters
ADD COLUMN IF NOT EXISTS "has_canteen" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "has_ev_charging" BOOLEAN DEFAULT FALSE;

-- RLS Policies for new table
ALTER TABLE "public"."beneficial_owners" ENABLE ROW LEVEL SECURITY;

-- Permissions for new table
GRANT ALL ON TABLE "public"."beneficial_owners" TO "anon";
GRANT ALL ON TABLE "public"."beneficial_owners" TO "authenticated";
GRANT ALL ON TABLE "public"."beneficial_owners" TO "service_role"; 