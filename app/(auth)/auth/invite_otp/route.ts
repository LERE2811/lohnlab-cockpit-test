//Here we are receving OTP from the Invite Mail of Supabase
//We are redirecting to the create-profile page with the OTP

import { createClient } from "@/utils/supabase/server";
import { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = request.nextUrl.clone();

  console.log("token_hash", token_hash);
  console.log("type", type);

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(`${request.nextUrl.origin}/set-password`);
    }
  }

  redirectTo.pathname =
    "/login?error=Fehler beim Verifizieren des Tokens. Bitte versuchen Sie es erneut.";
  return NextResponse.redirect(redirectTo);
}
