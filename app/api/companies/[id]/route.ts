import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// DELETE handler for removing a company
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const companyId = params.id;

    // Initialize Supabase with service role key (server-side only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
      },
    );

    // First, delete the company's subsidiaries
    const { error: subsidiariesError } = await supabase
      .from("subsidiaries")
      .delete()
      .eq("company_id", companyId);

    if (subsidiariesError) {
      console.error("Error deleting subsidiaries:", subsidiariesError);
      return NextResponse.json(
        { error: subsidiariesError.message },
        { status: 400 },
      );
    }

    // Delete the company's ansprechpartner
    const { error: ansprechpartnerError } = await supabase
      .from("ansprechpartner")
      .delete()
      .eq("company_id", companyId);

    if (ansprechpartnerError) {
      console.error("Error deleting ansprechpartner:", ansprechpartnerError);
      return NextResponse.json(
        { error: ansprechpartnerError.message },
        { status: 400 },
      );
    }

    // Delete any company_users associations
    const { error: companyUsersError } = await supabase
      .from("company_users")
      .delete()
      .eq("company_id", companyId);

    if (companyUsersError) {
      console.error("Error deleting company_users:", companyUsersError);
      return NextResponse.json(
        { error: companyUsersError.message },
        { status: 400 },
      );
    }

    // Finally, delete the company
    const { error: companyError } = await supabase
      .from("companies")
      .delete()
      .eq("id", companyId);

    if (companyError) {
      console.error("Error deleting company:", companyError);
      return NextResponse.json(
        { error: companyError.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unternehmen wurde erfolgreich gelöscht",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      {
        error:
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      },
      { status: 500 },
    );
  }
}

// PATCH handler for updating a company
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const companyId = params.id;
    const { name, vertriebspartner, ansprechpartner } = await request.json();

    // Initialize Supabase with service role key (server-side only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
      },
    );

    // Update company
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        name,
        vertriebspartner,
      })
      .eq("id", companyId);

    if (companyError) {
      console.error("Error updating company:", companyError);
      return NextResponse.json(
        { error: companyError.message },
        { status: 400 },
      );
    }

    // Update ansprechpartner if provided
    if (ansprechpartner) {
      // Check if ansprechpartner exists
      const { data: existingAnsprechpartner, error: fetchError } =
        await supabase
          .from("ansprechpartner")
          .select("id")
          .eq("company_id", companyId)
          .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is fine if no ansprechpartner exists yet
        console.error("Error fetching ansprechpartner:", fetchError);
        return NextResponse.json(
          { error: fetchError.message },
          { status: 400 },
        );
      }

      if (existingAnsprechpartner) {
        // Update existing ansprechpartner
        const { error: updateError } = await supabase
          .from("ansprechpartner")
          .update({
            firstname: ansprechpartner.firstname,
            lastname: ansprechpartner.lastname,
            email: ansprechpartner.email,
          })
          .eq("id", existingAnsprechpartner.id);

        if (updateError) {
          console.error("Error updating ansprechpartner:", updateError);
          return NextResponse.json(
            { error: updateError.message },
            { status: 400 },
          );
        }
      } else {
        // Create new ansprechpartner
        const { error: insertError } = await supabase
          .from("ansprechpartner")
          .insert({
            company_id: companyId,
            firstname: ansprechpartner.firstname,
            lastname: ansprechpartner.lastname,
            email: ansprechpartner.email,
          });

        if (insertError) {
          console.error("Error creating ansprechpartner:", insertError);
          return NextResponse.json(
            { error: insertError.message },
            { status: 400 },
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Unternehmen wurde erfolgreich aktualisiert",
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      {
        error:
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      },
      { status: 500 },
    );
  }
}
