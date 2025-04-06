import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@/utils/supabase/server";
import {
  GivveDocumentType,
  GivveDocumentCategory,
} from "@/app/constants/givveDocumentTypes";

export async function POST(request: NextRequest) {
  console.log("PDF Fill API called with method:", request.method);

  try {
    // Create Supabase client
    console.log("Creating Supabase client...");
    const supabaseClient = await createClient();
    console.log("Supabase client created successfully");

    // Parse request body
    console.log("Parsing request body...");
    const body = await request.json();
    const { formType, templatePath, formData, subsidiaryId } = body;
    console.log("Request params:", { formType, templatePath, subsidiaryId });
    console.log("Form data fields count:", Object.keys(formData || {}).length);

    if (!formType || !templatePath || !formData || !subsidiaryId) {
      console.error("Missing required parameters:", {
        formType,
        templatePath,
        formData: !!formData,
        subsidiaryId,
      });
      return NextResponse.json(
        { error: "Missing required parameters" },
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

    // Fill the PDF form
    console.log("Filling PDF form with data...");
    await fillPdfForm(pdfDoc, formData);
    console.log("PDF form filled successfully");

    // Save the filled PDF
    console.log("Saving filled PDF...");
    const filledPdfBytes = await pdfDoc.save();
    console.log("Filled PDF size:", filledPdfBytes.byteLength);

    // Upload the filled PDF to Supabase storage in the correct subsidiary folder
    const timestamp = Date.now();
    const filename =
      formType === "bestellformular"
        ? `Bestellformular_${timestamp}.pdf`
        : `Dokumentationsbogen_${timestamp}.pdf`;

    // Define path according to file organization strategy from file-organization.md:
    console.log("Preparing file path for storage...");
    // Create a type-specific subdirectory for better organization
    const documentType =
      formType === "bestellformular"
        ? GivveDocumentType.BESTELLFORMULAR
        : GivveDocumentType.DOKUMENTATIONSBOGEN;

    // Add timestamp to filename to prevent conflicts
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const fileWithTimestamp = `${timestamp}_${sanitizedFilename}`;

    // Construct the complete file path according to the documented structure
    const filePath = `${subsidiaryId}/${GivveDocumentCategory.PREFILLED_FORMS}/${documentType}/${fileWithTimestamp}`;
    console.log("Storage file path:", filePath);

    // Upload the filled PDF to the givve_documents bucket
    console.log("Uploading filled PDF to Supabase storage...");
    const { data: uploadData, error: uploadError } =
      await supabaseClient.storage
        .from("givve_documents")
        .upload(filePath, filledPdfBytes, {
          contentType: "application/pdf",
          upsert: true,
        });

    if (uploadError) {
      console.error("Error uploading filled PDF:", uploadError);
      return NextResponse.json(
        { error: "Failed to save filled PDF", details: uploadError },
        { status: 500 },
      );
    }
    console.log("PDF uploaded successfully");

    // Create a signed URL for the filled PDF from the givve_documents bucket
    console.log("Creating signed URL for filled PDF...");
    const { data: signedUrlData, error: signedUrlError } =
      await supabaseClient.storage
        .from("givve_documents")
        .createSignedUrl(filePath, 300); // 5 minutes expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Error creating signed URL:", signedUrlError);
      return NextResponse.json(
        { error: "Failed to create download link", details: signedUrlError },
        { status: 500 },
      );
    }
    console.log("Signed URL created successfully");

    console.log("PDF fill operation completed successfully");
    return NextResponse.json({
      success: true,
      downloadUrl: signedUrlData.signedUrl,
      filename,
      filePath,
      bucket: "givve_documents",
    });
  } catch (error) {
    console.error("Unexpected error in PDF fill API:", error);
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

// PDF Filling Helper Function
async function fillPdfForm(
  pdfDoc: PDFDocument,
  fieldValues: Record<string, string>,
): Promise<void> {
  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    console.log(`PDF has ${fields.length} form fields`);

    // Log field names for debugging
    const fieldNames = fields.map((field) => field.getName());
    console.log("Available field names:", fieldNames);

    // Map fields to their types
    const fieldMap = new Map(
      fields.map((field) => {
        let type = "unknown";

        if (field.constructor.name.includes("PDFTextField")) {
          type = "text";
        } else if (field.constructor.name.includes("PDFCheckBox")) {
          type = "checkbox";
        } else if (field.constructor.name.includes("PDFRadioGroup")) {
          type = "radio";
        } else if (field.constructor.name.includes("PDFDropdown")) {
          type = "dropdown";
        } else if (field.constructor.name.includes("PDFOptionList")) {
          type = "option";
        }

        return [field.getName(), type];
      }),
    );

    console.log(`Attempting to fill ${Object.keys(fieldValues).length} fields`);
    let filledCount = 0;
    let errorCount = 0;

    // Fill in each field if it exists
    for (const [key, value] of Object.entries(fieldValues)) {
      if (fieldMap.has(key)) {
        const fieldType = fieldMap.get(key);

        try {
          if (fieldType === "text") {
            // Handle text fields
            const field = form.getTextField(key);
            field.setText(value);
            filledCount++;
          } else if (fieldType === "checkbox") {
            // Handle checkbox fields
            const field = form.getCheckBox(key);
            if (
              value.toLowerCase() === "yes" ||
              value === "true" ||
              value === "1"
            ) {
              field.check();
            } else {
              field.uncheck();
            }
            filledCount++;
          } else if (fieldType === "radio") {
            // Handle radio button groups
            const field = form.getRadioGroup(key);
            field.select(value);
            filledCount++;
          } else if (fieldType === "dropdown" || fieldType === "option") {
            // Handle dropdown and option lists
            const field = form.getDropdown(key);
            field.select(value);
            filledCount++;
          }
        } catch (fieldError) {
          errorCount++;
          console.warn(
            `Error filling field "${key}" of type "${fieldType}":`,
            fieldError,
          );
        }
      } else {
        console.log(`Field not found in PDF: ${key}`);
      }
    }

    console.log(
      `PDF filling completed: ${filledCount} fields filled successfully, ${errorCount} errors`,
    );
  } catch (error) {
    console.error("Error filling PDF form:", error);
    throw new Error("Failed to fill PDF form");
  }
}
