//This page is used to create a profile for the user
//We are checking if the user is logged in and if the user has a profile
//If the user has a profile, we redirect to the dashboard
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const CreateProfilePage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?error=Ups, etwas ist schief gelaufen. Bitte versuche es erneut.",
    );
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50"></div>
  );
};

export default CreateProfilePage;
