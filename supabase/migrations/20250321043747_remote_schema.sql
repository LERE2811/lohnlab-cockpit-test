
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

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."create_user_company"("user_id" "uuid", "company_id" "uuid", "user_role" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  INSERT INTO company_users (user_id, company_id, role)
  VALUES (user_id, company_id, user_role);
END;$$;

ALTER FUNCTION "public"."create_user_company"("user_id" "uuid", "company_id" "uuid", "user_role" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_role" "text", "user_firstname" "text", "user_lastname" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  INSERT INTO user_profiles (id, email, role, firstname, lastname)
  VALUES (user_id, user_email, user_role, user_firstname, user_lastname);
END;$$;

ALTER FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_role" "text", "user_firstname" "text", "user_lastname" "text") OWNER TO "postgres";

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
            -- Handle both old 'category' and new 'categories' fields
            DECLARE
                categories_array text[] := '{}';
                single_category text;
            BEGIN
                -- Check if we have the new categories array
                IF contact_record ? 'categories' AND jsonb_array_length(contact_record->'categories') > 0 THEN
                    -- Convert JSONB array to text array
                    SELECT array_agg(value::text)
                    INTO categories_array
                    FROM jsonb_array_elements_text(contact_record->'categories');
                -- Fall back to single category if categories array is empty or not present
                ELSIF contact_record ? 'category' AND contact_record->>'category' != '' THEN
                    single_category := contact_record->>'category';
                    categories_array := ARRAY[single_category];
                END IF;
                
                INSERT INTO ansprechpartner (
                    company_id,
                    firstname,
                    lastname,
                    email,
                    phone,
                    category,
                    categories,
                    company_name,
                    has_cockpit_access
                ) VALUES (
                    (SELECT company_id FROM subsidiaries WHERE id = subsidiary_id_param),
                    contact_record->>'first_name',
                    contact_record->>'last_name',
                    contact_record->>'email',
                    contact_record->>'phone',
                    contact_record->>'category',
                    categories_array,
                    contact_record->>'company_name',
                    (contact_record->>'has_cockpit_access')::boolean
                );
            END;
        END LOOP;
    END IF;
    
    -- Update subsidiary with other fields
    UPDATE subsidiaries
    SET 
        has_works_council = (form_data_var->>'has_works_council')::boolean,
        has_collective_agreement = (form_data_var->>'has_collective_agreement')::boolean,
        collective_agreement_type = form_data_var->>'collective_agreement_type',
        collective_agreement_document_url = form_data_var->>'collective_agreement_file_url',
        has_givve_card = (form_data_var->>'has_givve_card')::boolean,
        payroll_processing = form_data_var->>'payroll_processing_type',
        payroll_system = form_data_var->>'payroll_system',
        wants_import_file = (form_data_var->>'wants_import_file')::boolean,
        import_date_type = form_data_var->>'import_date_type',
        custom_import_date = form_data_var->>'custom_import_date'
    WHERE id = subsidiary_id_param;
END;
$$;

ALTER FUNCTION "public"."extract_onboarding_data"("subsidiary_id_param" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."on_onboarding_complete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- If onboarding is being marked as completed
    IF NEW.onboarding_completed = true AND (OLD.onboarding_completed = false OR OLD.onboarding_completed IS NULL) THEN
        -- Extract and store the onboarding data
        PERFORM extract_onboarding_data(NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."on_onboarding_complete"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."ansprechpartner" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "email" "text" NOT NULL,
    "category" "text",
    "has_cockpit_access" boolean DEFAULT false,
    "company_name" "text",
    "phone" "text",
    "categories" "text"[] DEFAULT '{}'::"text"[]
);

ALTER TABLE "public"."ansprechpartner" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."billing_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subsidiary_id" "uuid" NOT NULL,
    "location_id" "uuid",
    "payment_method" "text" NOT NULL,
    "invoice_type" "text" NOT NULL,
    "iban" "text",
    "account_holder" "text",
    "billing_email" "text" NOT NULL,
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."billing_info" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "vertriebspartner" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."companies" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."company_users" (
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."company_users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subsidiary_id" "uuid" NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."employees" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."import_file_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subsidiary_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "date_type" "text" NOT NULL,
    "custom_date" "text",
    "last_generated" timestamp with time zone,
    "next_generation" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."import_file_schedules" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subsidiary_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "street" "text" NOT NULL,
    "house_number" "text" NOT NULL,
    "postal_code" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "has_canteen" boolean DEFAULT false,
    "has_charging_stations" boolean DEFAULT false,
    "is_headquarters" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."locations" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."onboarding_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subsidiary_id" "uuid" NOT NULL,
    "current_step" integer DEFAULT 1,
    "form_data" "jsonb" DEFAULT '{}'::"jsonb",
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."onboarding_progress" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "uuid" NOT NULL,
    "feature" "text" NOT NULL,
    "can_access" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."permissions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL
);

ALTER TABLE "public"."roles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."subsidiaries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid",
    "name" "text" NOT NULL,
    "legal_form" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "logo_url" "text",
    "payroll_processing" "text",
    "payroll_system" "text",
    "onboarding_completed" boolean DEFAULT false,
    "onboarding_step" integer DEFAULT 1,
    "has_works_council" boolean DEFAULT false,
    "has_collective_agreement" boolean DEFAULT false,
    "collective_agreement_type" "text",
    "collective_agreement_document_url" "text",
    "has_givve_card" boolean DEFAULT false,
    "headquarters_street" "text",
    "headquarters_house_number" "text",
    "headquarters_postal_code" "text",
    "headquarters_city" "text",
    "headquarters_state" "text",
    "headquarters_name" "text",
    "has_canteen" boolean DEFAULT false,
    "has_ev_charging" boolean DEFAULT false,
    "wants_import_file" boolean DEFAULT false,
    "import_date_type" "text" DEFAULT 'standard'::"text",
    "custom_import_date" "text"
);

ALTER TABLE "public"."subsidiaries" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."user_profiles" OWNER TO "postgres";

ALTER TABLE ONLY "public"."billing_info"
    ADD CONSTRAINT "billing_info_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."company_users"
    ADD CONSTRAINT "company_users_pkey" PRIMARY KEY ("user_id", "company_id");

ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."import_file_schedules"
    ADD CONSTRAINT "import_file_schedules_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."onboarding_progress"
    ADD CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."subsidiaries"
    ADD CONSTRAINT "subsidiaries_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");

CREATE OR REPLACE TRIGGER "trigger_onboarding_complete" AFTER UPDATE OF "onboarding_completed" ON "public"."subsidiaries" FOR EACH ROW EXECUTE FUNCTION "public"."on_onboarding_complete"();

ALTER TABLE ONLY "public"."ansprechpartner"
    ADD CONSTRAINT "ansprechpartner_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."billing_info"
    ADD CONSTRAINT "billing_info_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."billing_info"
    ADD CONSTRAINT "billing_info_subsidiary_id_fkey" FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."company_users"
    ADD CONSTRAINT "company_users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."company_users"
    ADD CONSTRAINT "company_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_subsidiary_id_fkey" FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."import_file_schedules"
    ADD CONSTRAINT "import_file_schedules_subsidiary_id_fkey" FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_subsidiary_id_fkey" FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."onboarding_progress"
    ADD CONSTRAINT "onboarding_progress_subsidiary_id_fkey" FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."subsidiaries"
    ADD CONSTRAINT "subsidiaries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE POLICY "All commands" ON "public"."onboarding_progress" TO "authenticated" USING (true);

CREATE POLICY "All commands for authenticated" ON "public"."company_users" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "All commands for authenticated" ON "public"."employees" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Allow all commands for authenticated" ON "public"."ansprechpartner" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Allow all commands for authenticated" ON "public"."companies" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Allow all commands for authenticated" ON "public"."subsidiaries" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON "public"."billing_info" USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON "public"."import_file_schedules" USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON "public"."locations" USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."roles" FOR SELECT USING (true);

CREATE POLICY "Everyone can read" ON "public"."permissions" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "all commands authenticated" ON "public"."user_profiles" TO "authenticated" USING (true) WITH CHECK (true);

ALTER TABLE "public"."ansprechpartner" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."billing_info" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."company_users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."import_file_schedules" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."onboarding_progress" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."subsidiaries" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."create_user_company"("user_id" "uuid", "company_id" "uuid", "user_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_company"("user_id" "uuid", "company_id" "uuid", "user_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_company"("user_id" "uuid", "company_id" "uuid", "user_role" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_role" "text", "user_firstname" "text", "user_lastname" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_role" "text", "user_firstname" "text", "user_lastname" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_role" "text", "user_firstname" "text", "user_lastname" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."extract_onboarding_data"("subsidiary_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."extract_onboarding_data"("subsidiary_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."extract_onboarding_data"("subsidiary_id_param" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."on_onboarding_complete"() TO "anon";
GRANT ALL ON FUNCTION "public"."on_onboarding_complete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."on_onboarding_complete"() TO "service_role";

GRANT ALL ON TABLE "public"."ansprechpartner" TO "anon";
GRANT ALL ON TABLE "public"."ansprechpartner" TO "authenticated";
GRANT ALL ON TABLE "public"."ansprechpartner" TO "service_role";

GRANT ALL ON TABLE "public"."billing_info" TO "anon";
GRANT ALL ON TABLE "public"."billing_info" TO "authenticated";
GRANT ALL ON TABLE "public"."billing_info" TO "service_role";

GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";

GRANT ALL ON TABLE "public"."company_users" TO "anon";
GRANT ALL ON TABLE "public"."company_users" TO "authenticated";
GRANT ALL ON TABLE "public"."company_users" TO "service_role";

GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";

GRANT ALL ON TABLE "public"."import_file_schedules" TO "anon";
GRANT ALL ON TABLE "public"."import_file_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."import_file_schedules" TO "service_role";

GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";

GRANT ALL ON TABLE "public"."onboarding_progress" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_progress" TO "service_role";

GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";

GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";

GRANT ALL ON TABLE "public"."subsidiaries" TO "anon";
GRANT ALL ON TABLE "public"."subsidiaries" TO "authenticated";
GRANT ALL ON TABLE "public"."subsidiaries" TO "service_role";

GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
