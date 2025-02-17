import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Fehler beim Verifizieren des Tokens. Bitte versuchen Sie es erneut.`,
    );
  }

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("ResetPasswordRoute - Exchange Error:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Fehler beim Verifizieren des Tokens. Bitte versuchen Sie es erneut.`,
      );
    }
  }
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/set-password`);
}
