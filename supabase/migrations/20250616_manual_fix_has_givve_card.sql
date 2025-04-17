-- Automated comprehensive fix for has_givve_card issues
-- This migration automatically handles all possible edge cases with the has_givve_card field

-- 1. Fix null values in subsidiaries table
UPDATE public.subsidiaries
SET has_givve_card = false
WHERE has_givve_card IS NULL;

-- 2. Ensure consistency between onboarding_progress and subsidiaries
-- This updates subsidiaries based on form_data, handling various JSON formats
UPDATE public.subsidiaries s
SET has_givve_card = 
  CASE
    -- Handle explicit true values in different formats
    WHEN op.form_data->>'has_givve_card' = 'true' THEN true
    WHEN op.form_data->>'has_givve_card' = '"true"' THEN true
    -- Handle numeric values (1 = true)
    WHEN op.form_data->>'has_givve_card' = '1' THEN true
    -- Handle explicit false values in different formats
    WHEN op.form_data->>'has_givve_card' = 'false' THEN false
    WHEN op.form_data->>'has_givve_card' = '"false"' THEN false
    -- Handle numeric values (0 = false)
    WHEN op.form_data->>'has_givve_card' = '0' THEN false
    -- Default to false for any other values
    ELSE false
  END
FROM public.onboarding_progress op
WHERE s.id = op.subsidiary_id 
  AND op.form_data ? 'has_givve_card';

-- 3. Add a trigger to ensure future consistency
-- This trigger runs after updating the onboarding_progress table to keep subsidiaries in sync
CREATE OR REPLACE FUNCTION "public"."sync_has_givve_card"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only update if the form_data has changed and contains has_givve_card
    IF NEW.form_data IS DISTINCT FROM OLD.form_data AND NEW.form_data ? 'has_givve_card' THEN
        -- Update the subsidiary with the normalized boolean value
        UPDATE public.subsidiaries
        SET has_givve_card = 
          CASE
            WHEN NEW.form_data->>'has_givve_card' = 'true' THEN true
            WHEN NEW.form_data->>'has_givve_card' = '"true"' THEN true
            WHEN NEW.form_data->>'has_givve_card' = '1' THEN true
            WHEN NEW.form_data->>'has_givve_card' = 'false' THEN false
            WHEN NEW.form_data->>'has_givve_card' = '"false"' THEN false
            WHEN NEW.form_data->>'has_givve_card' = '0' THEN false
            ELSE false
          END
        WHERE id = NEW.subsidiary_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS "on_onboarding_progress_update_sync_has_givve_card" ON "public"."onboarding_progress";
CREATE TRIGGER "on_onboarding_progress_update_sync_has_givve_card"
    AFTER UPDATE ON "public"."onboarding_progress"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."sync_has_givve_card"();

-- Grant permissions
GRANT ALL ON FUNCTION "public"."sync_has_givve_card"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_has_givve_card"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_has_givve_card"() TO "service_role";

-- 4. Debug: Check the types of has_givve_card values in form_data
-- This query can be used to debug the issue
-- SELECT 
--   s.id as subsidiary_id,
--   s.has_givve_card as subsidiary_value,
--   op.form_data->>'has_givve_card' as form_data_value,
--   pg_typeof(op.form_data->>'has_givve_card') as form_data_type,
--   pg_typeof(s.has_givve_card) as subsidiary_field_type
-- FROM public.subsidiaries s
-- JOIN public.onboarding_progress op ON s.id = op.subsidiary_id
-- WHERE op.form_data->>'has_givve_card' IS NOT NULL;

-- 5. Force update for a specific subsidiary (uncomment and modify as needed)
-- UPDATE public.subsidiaries 
-- SET has_givve_card = true
-- WHERE id = 'YOUR-SUBSIDIARY-ID-HERE'; 