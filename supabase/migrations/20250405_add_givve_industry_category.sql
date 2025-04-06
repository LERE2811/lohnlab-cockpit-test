-- Add givve_industry_category column to subsidiaries table
ALTER TABLE "public"."subsidiaries" 
ADD COLUMN IF NOT EXISTS "givve_industry_category" "text";

-- Update permissions for the new column
GRANT ALL ON TABLE "public"."subsidiaries" TO "anon";
GRANT ALL ON TABLE "public"."subsidiaries" TO "authenticated";
GRANT ALL ON TABLE "public"."subsidiaries" TO "service_role"; 