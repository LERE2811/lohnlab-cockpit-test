-- Add a status column to the givve_onboarding_progress table
-- This column will be used by admins to track the status of onboarding steps
-- that are not directly editable by users
ALTER TABLE "public"."givve_onboarding_progress" 
  ADD COLUMN IF NOT EXISTS "status" TEXT;

-- Add a comment to explain the column purpose
COMMENT ON COLUMN "public"."givve_onboarding_progress"."status" IS 'Admin-managed status for tracking onboarding progress';

-- Add the status column to the subsidiaries table as well for easier querying
ALTER TABLE "public"."subsidiaries"
  ADD COLUMN IF NOT EXISTS "givve_onboarding_status" TEXT;

-- Add a comment to explain the column purpose
COMMENT ON COLUMN "public"."subsidiaries"."givve_onboarding_status" IS 'Admin-managed status for tracking onboarding progress';

-- Update RLS policies to allow authenticated users to read the status
-- No need to add update policies as only admins will update this column through the service role

-- Grant permissions
GRANT ALL ON TABLE "public"."givve_onboarding_progress" TO "anon";
GRANT ALL ON TABLE "public"."givve_onboarding_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."givve_onboarding_progress" TO "service_role";

-- Update trigger function to copy status to subsidiary when changed
CREATE OR REPLACE FUNCTION "public"."on_givve_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- If status is being updated
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        -- Update the subsidiary with the new status
        UPDATE public.subsidiaries
        SET givve_onboarding_status = NEW.status
        WHERE id = NEW.subsidiary_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger for status changes
CREATE TRIGGER "on_givve_status_change"
    AFTER UPDATE ON "public"."givve_onboarding_progress"
    FOR EACH ROW
    WHEN (NEW.status IS DISTINCT FROM OLD.status)
    EXECUTE FUNCTION "public"."on_givve_status_change"();
