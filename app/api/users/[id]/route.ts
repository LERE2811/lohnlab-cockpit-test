import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// DELETE handler for removing a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;

    // Initialize Supabase with service role key (server-side only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
      },
    );

    // First, delete the user's company associations
    const { error: companyUserError } = await supabase
      .from("company_users")
      .delete()
      .eq("user_id", userId);

    if (companyUserError) {
      console.error("Error deleting company associations:", companyUserError);
      return NextResponse.json(
        { error: companyUserError.message },
        { status: 400 },
      );
    }

    // Delete the user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting user profile:", profileError);
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 },
      );
    }

    // Delete the user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Benutzer wurde erfolgreich gelöscht",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        error:
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      },
      { status: 500 },
    );
  }
}

// PATCH handler for updating a user
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;
    const { firstname, lastname, email, role, company } = await request.json();

    // Initialize Supabase with service role key (server-side only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
      },
    );

    // Update user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        firstname,
        lastname,
        email,
        role,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating user profile:", profileError);
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 },
      );
    }

    // Handle company association if role is User or Kundenbetreuer
    if (role === "User" || role === "Kundenbetreuer") {
      // First check if there's an existing company association
      const { data: existingCompany, error: fetchError } = await supabase
        .from("company_users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is fine if user doesn't have a company yet
        console.error("Error fetching company association:", fetchError);
        return NextResponse.json(
          { error: fetchError.message },
          { status: 400 },
        );
      }

      if (existingCompany) {
        // Update existing company association
        const { error: updateError } = await supabase
          .from("company_users")
          .update({
            company_id: company,
            role,
          })
          .eq("id", existingCompany.id);

        if (updateError) {
          console.error("Error updating company association:", updateError);
          return NextResponse.json(
            { error: updateError.message },
            { status: 400 },
          );
        }
      } else {
        // Create new company association
        const { error: insertError } = await supabase
          .from("company_users")
          .insert({
            user_id: userId,
            company_id: company,
            role,
          });

        if (insertError) {
          console.error("Error creating company association:", insertError);
          return NextResponse.json(
            { error: insertError.message },
            { status: 400 },
          );
        }
      }
    } else if (role === "Admin") {
      // If role is Admin, remove any company associations
      const { error: deleteError } = await supabase
        .from("company_users")
        .delete()
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Error removing company associations:", deleteError);
        return NextResponse.json(
          { error: deleteError.message },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Benutzer wurde erfolgreich aktualisiert",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        error:
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      },
      { status: 500 },
    );
  }
}
