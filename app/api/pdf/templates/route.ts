import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  console.log("PDF templates list API called");

  try {
    // Create Supabase client
    console.log("Creating Supabase client...");
    const supabaseClient = await createClient();
    console.log("Supabase client created successfully");

    // List files in the templates directory
    console.log("Listing template files...");
    const { data: files, error } = await supabaseClient.storage
      .from("givve_documents")
      .list("templates");

    if (error) {
      console.error("Error listing template files:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to list template files",
          details: error,
        },
        { status: 500 },
      );
    }

    console.log(`Found ${files?.length || 0} template files`);

    // Try to get a signed URL for one of the template files
    let signedUrlTest = null;
    if (files && files.length > 0) {
      const firstPdfFile = files.find((file) => file.name.endsWith(".pdf"));
      if (firstPdfFile) {
        const { data: urlData, error: urlError } = await supabaseClient.storage
          .from("givve_documents")
          .createSignedUrl(`templates/${firstPdfFile.name}`, 60);

        if (urlError) {
          console.error("Error creating signed URL:", urlError);
        } else {
          signedUrlTest = {
            fileName: firstPdfFile.name,
            signedUrl: urlData.signedUrl,
          };
          console.log("Created signed URL for test file:", firstPdfFile.name);
        }
      }
    }

    return NextResponse.json({
      success: true,
      files: files?.map((file) => ({
        name: file.name,
        size: file.metadata?.size || 0,
        created: file.created_at,
      })),
      signedUrlTest,
    });
  } catch (error) {
    console.error("Error in template list API:", error);
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to list templates",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
