-- Create a dedicated table for givve onboarding progress
CREATE TABLE IF NOT EXISTS "public"."givve_onboarding_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subsidiary_id" UUID NOT NULL,
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "form_data" JSONB NOT NULL DEFAULT '{}',
    "documents_submitted" BOOLEAN DEFAULT FALSE,
    "video_identification_completed" BOOLEAN DEFAULT FALSE,
    "initial_invoice_received" BOOLEAN DEFAULT FALSE,
    "initial_invoice_paid" BOOLEAN DEFAULT FALSE,
    "card_design_verified" BOOLEAN DEFAULT FALSE,
    "legal_documents_uploaded" BOOLEAN DEFAULT FALSE,
    "completed" BOOLEAN DEFAULT FALSE,
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE
);

-- Create appropriate indexes
CREATE INDEX IF NOT EXISTS "givve_onboarding_progress_subsidiary_id_idx" ON "public"."givve_onboarding_progress" ("subsidiary_id");

-- Add RLS policies for givve_onboarding_progress
ALTER TABLE "public"."givve_onboarding_progress" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON "public"."givve_onboarding_progress"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM subsidiaries s
    JOIN company_users cu ON s.company_id = cu.company_id
    WHERE s.id = subsidiary_id AND cu.user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated users" ON "public"."givve_onboarding_progress"
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM subsidiaries s
    JOIN company_users cu ON s.company_id = cu.company_id
    WHERE s.id = subsidiary_id AND cu.user_id = auth.uid()
  )
);

CREATE POLICY "Enable update for authenticated users" ON "public"."givve_onboarding_progress"
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM subsidiaries s
    JOIN company_users cu ON s.company_id = cu.company_id
    WHERE s.id = subsidiary_id AND cu.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM subsidiaries s
    JOIN company_users cu ON s.company_id = cu.company_id
    WHERE s.id = subsidiary_id AND cu.user_id = auth.uid()
  )
);

-- Add columns to the subsidiaries table for givve-specific data
ALTER TABLE "public"."subsidiaries" 
  ADD COLUMN IF NOT EXISTS "givve_onboarding_step" INTEGER,
  ADD COLUMN IF NOT EXISTS "givve_onboarding_completed" BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "givve_card_design_type" TEXT,
  ADD COLUMN IF NOT EXISTS "givve_card_second_line" TEXT,
  ADD COLUMN IF NOT EXISTS "givve_industry_category" TEXT,
  ADD COLUMN IF NOT EXISTS "givve_company_logo_url" TEXT,
  ADD COLUMN IF NOT EXISTS "givve_card_design_url" TEXT,
  ADD COLUMN IF NOT EXISTS "givve_video_identification_link" TEXT,
  ADD COLUMN IF NOT EXISTS "givve_order_forms_downloaded" BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "givve_documentation_forms_downloaded" BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "givve_legal_documents_bucket_path" TEXT;

-- Create givve_documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('givve_documents', 'givve_documents', false);

-- Create givve_documents storage policies
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'givve_documents' AND
  (
    auth.role() = 'authenticated'
  )
);

CREATE POLICY "Allow authenticated users to select their documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'givve_documents' AND
  (
    auth.role() = 'authenticated'
  )
);

CREATE POLICY "Allow authenticated users to update their documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'givve_documents' AND
  (
    auth.role() = 'authenticated'
  )
);

-- Create templates folder within the givve_documents bucket
-- This will be used to store the template forms that users can download
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES 
  ('givve_documents', 'templates/', auth.uid(), '{"contentType": "application/x-directory"}');

-- Add RLS (Row Level Security) policies
ALTER TABLE "public"."givve_onboarding_progress" ENABLE ROW LEVEL SECURITY;

-- Add policies for authenticated users
CREATE POLICY "Allow authenticated users to read own subsidiary givve onboarding progress"
ON "public"."givve_onboarding_progress" FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.company_users cu
        JOIN public.subsidiaries s ON s.company_id = cu.company_id
        WHERE cu.user_id = auth.uid() AND s.id = givve_onboarding_progress.subsidiary_id
    )
);

CREATE POLICY "Allow authenticated users to insert own subsidiary givve onboarding progress"
ON "public"."givve_onboarding_progress" FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.company_users cu
        JOIN public.subsidiaries s ON s.company_id = cu.company_id
        WHERE cu.user_id = auth.uid() AND s.id = givve_onboarding_progress.subsidiary_id
    )
);

CREATE POLICY "Allow authenticated users to update own subsidiary givve onboarding progress"
ON "public"."givve_onboarding_progress" FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.company_users cu
        JOIN public.subsidiaries s ON s.company_id = cu.company_id
        WHERE cu.user_id = auth.uid() AND s.id = givve_onboarding_progress.subsidiary_id
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.company_users cu
        JOIN public.subsidiaries s ON s.company_id = cu.company_id
        WHERE cu.user_id = auth.uid() AND s.id = givve_onboarding_progress.subsidiary_id
    )
);

-- Set permissions
GRANT ALL ON TABLE "public"."givve_onboarding_progress" TO "anon";
GRANT ALL ON TABLE "public"."givve_onboarding_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."givve_onboarding_progress" TO "service_role";

-- Create a storage bucket for Givve documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('givve_documents', 'givve_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for givve_documents bucket
CREATE POLICY "Allow authenticated users to upload to givve_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'givve_documents' AND
    EXISTS (
        SELECT 1 FROM public.company_users cu
        JOIN public.subsidiaries s ON s.company_id = cu.company_id
        WHERE cu.user_id = auth.uid() AND
              (storage.foldername(name))[1] = s.id::text
    )
);

CREATE POLICY "Allow authenticated users to select from givve_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'givve_documents' AND
    EXISTS (
        SELECT 1 FROM public.company_users cu
        JOIN public.subsidiaries s ON s.company_id = cu.company_id
        WHERE cu.user_id = auth.uid() AND
              (storage.foldername(name))[1] = s.id::text
    )
);

-- Create trigger function to update subsidiary when onboarding completes
CREATE OR REPLACE FUNCTION "public"."on_givve_onboarding_complete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- If givve onboarding is being marked as completed
    IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
        -- Update the subsidiary with givve onboarding status
        UPDATE public.subsidiaries
        SET 
            givve_onboarding_completed = true,
            givve_onboarding_step = NEW.current_step,
            -- Also update key fields directly from the progress table
            givve_video_identification_link = NEW.form_data->>'videoIdentificationLink',
            givve_order_forms_downloaded = COALESCE((NEW.form_data->'documents'->'orderForms'->>'bestellformularDownloaded')::boolean, false),
            givve_documentation_forms_downloaded = COALESCE((NEW.form_data->'documents'->'orderForms'->>'dokumentationsbogenDownloaded')::boolean, false)
        WHERE id = NEW.subsidiary_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER "on_givve_onboarding_complete"
    AFTER UPDATE ON "public"."givve_onboarding_progress"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."on_givve_onboarding_complete"(); 