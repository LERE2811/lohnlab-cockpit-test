//This page is used to set the password for the user
//We are checking if the user is logged in
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SetPasswordForm from "./(subcomponents)/SetPasswordForm";

const SetPasswordPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?error=Ups, etwas ist schief gelaufen. Bitte versuche es erneut.",
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <SetPasswordForm user={user} />
    </div>
  );
};

export default SetPasswordPage;
