-- Erweiterung der companies Tabelle um zusätzliche Felder für das Onboarding
ALTER TABLE "public"."companies" 
ADD COLUMN IF NOT EXISTS "tax_number" TEXT,
ADD COLUMN IF NOT EXISTS "logo_url" TEXT,
ADD COLUMN IF NOT EXISTS "street" TEXT,
ADD COLUMN IF NOT EXISTS "house_number" TEXT,
ADD COLUMN IF NOT EXISTS "postal_code" TEXT,
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "commercial_register" TEXT,
ADD COLUMN IF NOT EXISTS "commercial_register_number" TEXT,
ADD COLUMN IF NOT EXISTS "commercial_register_file_url" TEXT,
ADD COLUMN IF NOT EXISTS "payroll_processing" TEXT, -- 'internal' oder 'external'
ADD COLUMN IF NOT EXISTS "payroll_system" TEXT,
ADD COLUMN IF NOT EXISTS "onboarding_completed" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "onboarding_step" INTEGER DEFAULT 1;

-- Tabelle für Geschäftsführer
CREATE TABLE IF NOT EXISTS "public"."managing_directors" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "company_id" UUID NOT NULL REFERENCES "public"."companies"("id") ON DELETE CASCADE,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabelle für Ansprechpartner der Lohnabrechnung
CREATE TABLE IF NOT EXISTS "public"."payroll_contacts" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "company_id" UUID NOT NULL REFERENCES "public"."companies"("id") ON DELETE CASCADE,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabelle für Onboarding-Fortschritt
CREATE TABLE IF NOT EXISTS "public"."onboarding_progress" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "company_id" UUID NOT NULL REFERENCES "public"."companies"("id") ON DELETE CASCADE,
    "current_step" INTEGER DEFAULT 1,
    "form_data" JSONB DEFAULT '{}'::jsonb,
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS Policies
ALTER TABLE "public"."managing_directors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."payroll_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."onboarding_progress" ENABLE ROW LEVEL SECURITY;

-- Berechtigungen
GRANT ALL ON TABLE "public"."managing_directors" TO "anon";
GRANT ALL ON TABLE "public"."managing_directors" TO "authenticated";
GRANT ALL ON TABLE "public"."managing_directors" TO "service_role";

GRANT ALL ON TABLE "public"."payroll_contacts" TO "anon";
GRANT ALL ON TABLE "public"."payroll_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."payroll_contacts" TO "service_role";

GRANT ALL ON TABLE "public"."onboarding_progress" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_progress" TO "service_role";