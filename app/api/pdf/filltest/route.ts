import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  console.log("PDF fill test API called");

  try {
    // Create Supabase client
    console.log("Creating Supabase client...");
    const supabaseClient = await createClient();
    console.log("Supabase client created successfully");

    // Parse request body
    console.log("Parsing request body...");
    const body = await request.json();
    const { templatePath } = body;

    if (!templatePath) {
      return NextResponse.json(
        { error: "Missing template path" },
        { status: 400 },
      );
    }

    // Generate a signed URL for the template PDF
    console.log("Generating signed URL for template:", templatePath);
    const { data: fileData, error: fileError } = await supabaseClient.storage
      .from("givve_documents")
      .createSignedUrl(templatePath, 60);

    if (fileError || !fileData?.signedUrl) {
      console.error("Error getting template file:", fileError);
      return NextResponse.json(
        { error: "Failed to access template file", details: fileError },
        { status: 500 },
      );
    }
    console.log("Signed URL created successfully");

    // Fetch the PDF template
    console.log("Fetching PDF template from signed URL...");
    const response = await fetch(fileData.signedUrl);
    if (!response.ok) {
      console.error(
        "Failed to fetch PDF template:",
        response.status,
        response.statusText,
      );
      return NextResponse.json(
        {
          error: `Failed to fetch PDF template: ${response.status} ${response.statusText}`,
        },
        { status: 500 },
      );
    }

    console.log("PDF template fetched, processing array buffer...");
    const pdfBytes = await response.arrayBuffer();
    console.log("PDF buffer size:", pdfBytes.byteLength);

    console.log("Loading PDF document...");
    const pdfDoc = await PDFDocument.load(pdfBytes);
    console.log("PDF document loaded successfully");

    // Get form fields for diagnostic purposes
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    console.log(`PDF has ${fields.length} form fields`);

    // Log field names for debugging
    const fieldNames = fields.map((field) => ({
      name: field.getName(),
      type: field.constructor.name,
    }));

    // Return field information
    return NextResponse.json({
      success: true,
      pdfInfo: {
        path: templatePath,
        fieldCount: fields.length,
        fields: fieldNames,
      },
    });
  } catch (error) {
    console.error("Unexpected error in PDF fill test API:", error);
    // Log stack trace if available
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
