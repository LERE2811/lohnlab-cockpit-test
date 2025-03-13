-- Migration for import file preferences
-- This migration adds support for the new import file preferences in the Lohnabrechnung step

-- Set up the migration environment
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Update the extract_onboarding_data function to handle the new fields
CREATE OR REPLACE FUNCTION "public"."extract_onboarding_data"("subsidiary_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    form_data_var jsonb;
    location_record jsonb;
    billing_record jsonb;
    contact_record jsonb;
    location_id uuid;
    new_location_id uuid;
BEGIN
    -- Get the form data from onboarding_progress
    SELECT op.form_data INTO form_data_var
    FROM onboarding_progress op
    WHERE op.subsidiary_id = subsidiary_id_param
    ORDER BY op.last_updated DESC
    LIMIT 1;
    
    -- Skip if no form data found
    IF form_data_var IS NULL THEN
        RETURN;
    END IF;
    
    -- Process locations
    IF form_data_var ? 'locations' AND jsonb_array_length(form_data_var->'locations') > 0 THEN
        -- Delete existing locations for this subsidiary
        DELETE FROM locations WHERE subsidiary_id = subsidiary_id_param;
        
        -- Insert new locations
        FOR location_record IN SELECT * FROM jsonb_array_elements(form_data_var->'locations')
        LOOP
            INSERT INTO locations (
                subsidiary_id,
                name,
                street,
                house_number,
                postal_code,
                city,
                state,
                has_canteen,
                has_charging_stations,
                is_headquarters
            ) VALUES (
                subsidiary_id_param,
                location_record->>'name',
                location_record->>'street',
                location_record->>'house_number',
                location_record->>'postal_code',
                location_record->>'city',
                location_record->>'state',
                (location_record->>'has_canteen')::boolean,
                (location_record->>'has_charging_stations')::boolean,
                (location_record->>'is_headquarters')::boolean
            )
            RETURNING id INTO new_location_id;
            
            -- If this is the headquarters, update the subsidiary record
            IF (location_record->>'is_headquarters')::boolean THEN
                UPDATE subsidiaries
                SET 
                    headquarters_name = location_record->>'name',
                    headquarters_street = location_record->>'street',
                    headquarters_house_number = location_record->>'house_number',
                    headquarters_postal_code = location_record->>'postal_code',
                    headquarters_city = location_record->>'city',
                    headquarters_state = location_record->>'state',
                    has_canteen = (location_record->>'has_canteen')::boolean,
                    has_ev_charging = (location_record->>'has_charging_stations')::boolean
                WHERE id = subsidiary_id_param;
            END IF;
        END LOOP;
    END IF;
    
    -- Process billing info
    IF form_data_var ? 'payment_method' AND form_data_var ? 'invoice_type' AND form_data_var ? 'billing_info' THEN
        -- Delete existing billing info for this subsidiary
        DELETE FROM billing_info WHERE subsidiary_id = subsidiary_id_param;
        
        -- Insert new billing info
        FOR billing_record IN SELECT * FROM jsonb_array_elements(form_data_var->'billing_info')
        LOOP
            -- Find the location ID if location_name is provided
            location_id := NULL;
            IF billing_record ? 'location_name' AND billing_record->>'location_name' != '' THEN
                SELECT id INTO location_id
                FROM locations
                WHERE subsidiary_id = subsidiary_id_param AND name = billing_record->>'location_name'
                LIMIT 1;
            END IF;
            
            INSERT INTO billing_info (
                subsidiary_id,
                location_id,
                payment_method,
                invoice_type,
                iban,
                account_holder,
                billing_email,
                phone
            ) VALUES (
                subsidiary_id_param,
                location_id,
                form_data_var->>'payment_method',
                form_data_var->>'invoice_type',
                billing_record->>'iban',
                billing_record->>'account_holder',
                billing_record->>'billing_email',
                billing_record->>'phone'
            );
        END LOOP;
    END IF;
    
    -- Process contacts
    IF form_data_var ? 'contacts' AND jsonb_array_length(form_data_var->'contacts') > 0 THEN
        -- Delete existing contacts for this subsidiary
        DELETE FROM ansprechpartner WHERE company_id = (
            SELECT company_id FROM subsidiaries WHERE id = subsidiary_id_param
        );
        
        -- Insert new contacts
        FOR contact_record IN SELECT * FROM jsonb_array_elements(form_data_var->'contacts')
        LOOP
            INSERT INTO ansprechpartner (
                company_id,
                firstname,
                lastname,
                email,
                phone,
                category,
                company_name,
                has_cockpit_access
            ) VALUES (
                (SELECT company_id FROM subsidiaries WHERE id = subsidiary_id_param),
                contact_record->>'first_name',
                contact_record->>'last_name',
                contact_record->>'email',
                contact_record->>'phone',
                contact_record->>'category',
                contact_record->>'company_name',
                (contact_record->>'has_cockpit_access')::boolean
            );
        END LOOP;
    END IF;
    
    -- Update subsidiary with other fields
    UPDATE subsidiaries
    SET 
        legal_form = form_data_var->>'company_form',
        has_works_council = (form_data_var->>'has_works_council')::boolean,
        has_collective_agreement = (form_data_var->>'has_collective_agreement')::boolean,
        collective_agreement_type = form_data_var->>'collective_agreement_type',
        collective_agreement_document_url = form_data_var->>'collective_agreement_file_url',
        has_givve_card = (form_data_var->>'has_givve_card')::boolean,
        givve_legal_form = form_data_var->>'givve_legal_form',
        givve_card_design_type = form_data_var->>'givve_card_design_type',
        givve_company_logo_url = form_data_var->>'givve_company_logo_url',
        givve_card_design_url = form_data_var->>'givve_card_design_url',
        givve_standard_postal_code = form_data_var->>'givve_standard_postal_code',
        givve_card_second_line = form_data_var->>'givve_card_second_line',
        givve_loading_date = form_data_var->>'givve_loading_date',
        givve_industry_category = form_data_var->>'givve_industry_category',
        payroll_processing = form_data_var->>'payroll_processing_type',
        payroll_system = form_data_var->>'payroll_system',
        wants_import_file = (form_data_var->>'wants_import_file')::boolean,
        import_date_type = form_data_var->>'import_date_type',
        custom_import_date = form_data_var->>'custom_import_date'
    WHERE id = subsidiary_id_param;
END;
$$;

-- Add new columns to the subsidiaries table
ALTER TABLE "public"."subsidiaries" 
ADD COLUMN IF NOT EXISTS "wants_import_file" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "import_date_type" text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS "custom_import_date" text;

-- Create a new table for import file schedules (for future use)
CREATE TABLE IF NOT EXISTS "public"."import_file_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subsidiary_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "date_type" text NOT NULL,
    "custom_date" text,
    "last_generated" timestamp with time zone,
    "next_generation" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE
);

-- Set up RLS policies for the new table
ALTER TABLE "public"."import_file_schedules" ENABLE ROW LEVEL SECURITY;

-- Create policies for import_file_schedules
CREATE POLICY "Allow all operations for authenticated users" ON "public"."import_file_schedules"
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON TABLE "public"."import_file_schedules" TO "anon";
GRANT ALL ON TABLE "public"."import_file_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."import_file_schedules" TO "service_role";

-- Update the function to grant permissions
GRANT ALL ON FUNCTION "public"."extract_onboarding_data"("subsidiary_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."extract_onboarding_data"("subsidiary_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."extract_onboarding_data"("subsidiary_id_param" "uuid") TO "service_role"; 