import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, firstname, lastname, role, company } = await request.json();

    // Initialize Supabase with service role key (server-side only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false }, // No need for session persistence in a server function
      },
    );

    // Invite user
    const { data: authData, error: authError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        data: { role, firstname, lastname },
      });

    if (authError) {
      console.error("Auth Error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase.rpc(
        "create_user_profile",
        {
          user_id: authData.user.id,
          user_email: email,
          user_role: role,
          user_firstname: firstname,
          user_lastname: lastname,
        },
      );

      if (profileError) {
        console.error("Profile Error:", profileError);
        await supabase.auth.admin.deleteUser(authData.user.id); // Rollback if profile creation fails
        return NextResponse.json(
          { error: profileError.message },
          { status: 400 },
        );
      }

      if (role === "User" || role === "Kundenbetreuer") {
        const { error: companyError } = await supabase.rpc(
          "create_user_company",
          {
            user_id: authData.user.id,
            company_id: company,
            user_role: role,
          },
        );

        if (companyError) {
          console.error("Company Error:", companyError);
          await supabase.auth.admin.deleteUser(authData.user.id); // Rollback if company creation fails
          return NextResponse.json(
            { error: companyError.message },
            { status: 400 },
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Einladung wurde erfolgreich an ${email} gesendet.`,
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      {
        error:
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      },
      { status: 500 },
    );
  }
}
