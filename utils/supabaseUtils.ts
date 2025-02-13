import { createClient } from "@/utils/supabase/server";

export const getUserProfile = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userProfile, error: userProfileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user?.id);

  if (userProfileError) {
    console.error(userProfileError);
  }

  return userProfile?.[0];
};
