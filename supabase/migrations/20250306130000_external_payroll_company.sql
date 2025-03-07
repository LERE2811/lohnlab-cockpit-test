
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

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

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

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."ansprechpartner" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "email" "text" NOT NULL
);

ALTER TABLE "public"."ansprechpartner" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."beneficial_owners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subsidiary_id" "uuid" NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "birth_date" "date" NOT NULL,
    "nationality" "text" NOT NULL,
    "ownership_percentage" "text" NOT NULL,
    "has_public_office" boolean DEFAULT false,
    "public_office_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."beneficial_owners" OWNER TO "postgres";

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

CREATE TABLE IF NOT EXISTS "public"."managing_directors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subsidiary_id" "uuid" NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."managing_directors" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."onboarding_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subsidiary_id" "uuid" NOT NULL,
    "current_step" integer DEFAULT 1,
    "form_data" "jsonb" DEFAULT '{}'::"jsonb",
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."onboarding_progress" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."payroll_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subsidiary_id" "uuid" NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "company_name" "text"
);

ALTER TABLE "public"."payroll_contacts" OWNER TO "postgres";

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
    "tax_number" "text",
    "logo_url" "text",
    "street" "text",
    "house_number" "text",
    "postal_code" "text",
    "city" "text",
    "commercial_register" "text",
    "commercial_register_number" "text",
    "commercial_register_file_url" "text",
    "payroll_processing" "text",
    "payroll_system" "text",
    "onboarding_completed" boolean DEFAULT false,
    "onboarding_step" integer DEFAULT 1,
    "has_works_council" boolean DEFAULT false,
    "has_collective_agreement" boolean DEFAULT false,
    "collective_agreement_type" "text",
    "collective_agreement_document_url" "text",
    "has_givve_card" boolean DEFAULT false,
    "givve_legal_form" "text",
    "givve_card_design_type" "text",
    "givve_company_logo_url" "text",
    "givve_card_design_url" "text",
    "givve_standard_postal_code" "text",
    "givve_card_second_line" "text",
    "givve_loading_date" "text",
    "givve_industry_category" "text",
    "headquarters_street" "text",
    "headquarters_house_number" "text",
    "headquarters_postal_code" "text",
    "headquarters_city" "text",
    "headquarters_state" "text",
    "headquarters_name" "text",
    "has_canteen" boolean DEFAULT false,
    "has_ev_charging" boolean DEFAULT false
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

ALTER TABLE ONLY "public"."beneficial_owners"
    ADD CONSTRAINT "beneficial_owners_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."company_users"
    ADD CONSTRAINT "company_users_pkey" PRIMARY KEY ("user_id", "company_id");

ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."managing_directors"
    ADD CONSTRAINT "managing_directors_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."onboarding_progress"
    ADD CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."payroll_contacts"
    ADD CONSTRAINT "payroll_contacts_pkey" PRIMARY KEY ("id");

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

ALTER TABLE ONLY "public"."ansprechpartner"
    ADD CONSTRAINT "ansprechpartner_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."beneficial_owners"
    ADD CONSTRAINT "beneficial_owners_subsidiary_id_fkey" FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."company_users"
    ADD CONSTRAINT "company_users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."company_users"
    ADD CONSTRAINT "company_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_subsidiary_id_fkey" FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."managing_directors"
    ADD CONSTRAINT "managing_directors_subsidiary_id_fkey" FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."onboarding_progress"
    ADD CONSTRAINT "onboarding_progress_subsidiary_id_fkey" FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."payroll_contacts"
    ADD CONSTRAINT "payroll_contacts_subsidiary_id_fkey" FOREIGN KEY ("subsidiary_id") REFERENCES "public"."subsidiaries"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."subsidiaries"
    ADD CONSTRAINT "subsidiaries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE POLICY "All commands for authenticated" ON "public"."company_users" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "All commands for authenticated" ON "public"."employees" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Allow all commands for authenticated" ON "public"."ansprechpartner" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Allow all commands for authenticated" ON "public"."companies" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Allow all commands for authenticated" ON "public"."subsidiaries" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."roles" FOR SELECT USING (true);

CREATE POLICY "Everyone can read" ON "public"."permissions" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "all commands authenticated" ON "public"."user_profiles" TO "authenticated" USING (true) WITH CHECK (true);

ALTER TABLE "public"."ansprechpartner" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."beneficial_owners" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."company_users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."managing_directors" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."onboarding_progress" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."payroll_contacts" ENABLE ROW LEVEL SECURITY;

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

GRANT ALL ON TABLE "public"."ansprechpartner" TO "anon";
GRANT ALL ON TABLE "public"."ansprechpartner" TO "authenticated";
GRANT ALL ON TABLE "public"."ansprechpartner" TO "service_role";

GRANT ALL ON TABLE "public"."beneficial_owners" TO "anon";
GRANT ALL ON TABLE "public"."beneficial_owners" TO "authenticated";
GRANT ALL ON TABLE "public"."beneficial_owners" TO "service_role";

GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";

GRANT ALL ON TABLE "public"."company_users" TO "anon";
GRANT ALL ON TABLE "public"."company_users" TO "authenticated";
GRANT ALL ON TABLE "public"."company_users" TO "service_role";

GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";

GRANT ALL ON TABLE "public"."managing_directors" TO "anon";
GRANT ALL ON TABLE "public"."managing_directors" TO "authenticated";
GRANT ALL ON TABLE "public"."managing_directors" TO "service_role";

GRANT ALL ON TABLE "public"."onboarding_progress" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_progress" TO "service_role";

GRANT ALL ON TABLE "public"."payroll_contacts" TO "anon";
GRANT ALL ON TABLE "public"."payroll_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."payroll_contacts" TO "service_role";

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
