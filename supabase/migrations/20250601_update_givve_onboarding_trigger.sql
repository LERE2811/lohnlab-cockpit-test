-- Update trigger function to include has_givve_card when updating the subsidiary record
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
            -- Copy value from onboarding form_data to the subsidiary
            has_givve_card = COALESCE((NEW.form_data->>'has_givve_card')::boolean, false),
            -- Also update key fields directly from the progress table
            givve_video_identification_link = NEW.form_data->>'videoIdentificationLink',
            givve_order_forms_downloaded = COALESCE((NEW.form_data->'documents'->'orderForms'->>'bestellformularDownloaded')::boolean, false),
            givve_documentation_forms_downloaded = COALESCE((NEW.form_data->'documents'->'orderForms'->>'dokumentationsbogenDownloaded')::boolean, false)
        WHERE id = NEW.subsidiary_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Also update existing subsidiaries based on their onboarding_progress data
-- (Update the regular onboarding_progress table since that's where the has_givve_card value is stored)
UPDATE public.subsidiaries s
SET has_givve_card = COALESCE((op.form_data->>'has_givve_card')::boolean, false)
FROM public.onboarding_progress op
WHERE s.id = op.subsidiary_id 
  AND op.form_data->>'has_givve_card' IS NOT NULL
  AND s.has_givve_card IS NULL; 