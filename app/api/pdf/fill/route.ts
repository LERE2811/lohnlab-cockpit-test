import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@/utils/supabase/server";
import {
  GivveDocumentType,
  GivveDocumentCategory,
} from "@/app/constants/givveDocumentTypes";

// Force Node.js runtime for pdf-lib compatibility
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabaseClient = await createClient();

    // Parse request body
    const body = await request.json();
    const { formType, templatePath, formData, subsidiaryId } = body;

    console.log("PDF fill request received:", {
      formType,
      templatePath,
      subsidiaryId,
    });

    if (!formType || !templatePath || !formData || !subsidiaryId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Generate a signed URL for the template PDF with longer expiry (5 minutes)
    const { data: fileData, error: fileError } = await supabaseClient.storage
      .from("givve_documents")
      .createSignedUrl(templatePath, 300); // 5 minutes expiry for cold starts

    if (fileError || !fileData?.signedUrl) {
      console.error("Error getting template file:", fileError);
      return NextResponse.json(
        { error: "Failed to access template file", details: fileError },
        { status: 500 },
      );
    }

    console.log("Template signed URL generated successfully");

    // Fetch the PDF template with error handling
    let pdfBytes;
    try {
      const response = await fetch(fileData.signedUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch template: ${response.status} ${response.statusText}`,
        );
      }

      pdfBytes = await response.arrayBuffer();
      console.log(
        `Template fetched successfully, size: ${pdfBytes.byteLength} bytes`,
      );

      if (pdfBytes.byteLength === 0) {
        throw new Error("Received empty PDF template");
      }
    } catch (fetchError: any) {
      console.error("Error fetching PDF template:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch PDF template", details: fetchError.message },
        { status: 500 },
      );
    }

    // Load and fill the PDF
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(pdfBytes);
      console.log(
        "PDF loaded successfully, page count:",
        pdfDoc.getPageCount(),
      );
    } catch (loadError: any) {
      console.error("Error loading PDF document:", loadError);
      return NextResponse.json(
        { error: "Failed to load PDF document", details: loadError.message },
        { status: 500 },
      );
    }

    // Fill the PDF form
    try {
      await fillPdfForm(pdfDoc, formData);
      console.log("PDF form filled successfully");
    } catch (fillError: any) {
      console.error("Error filling PDF form:", fillError);
      return NextResponse.json(
        { error: "Failed to fill PDF form", details: fillError.message },
        { status: 500 },
      );
    }

    // Save the filled PDF
    let filledPdfBytes;
    try {
      filledPdfBytes = await pdfDoc.save();
      console.log(
        `Filled PDF generated successfully, size: ${filledPdfBytes.byteLength} bytes`,
      );

      // Check if file size exceeds Vercel's payload limits (4MB)
      if (filledPdfBytes.byteLength > 4 * 1024 * 1024) {
        console.warn(
          "Warning: Generated PDF exceeds 4MB, may cause issues with Vercel",
        );
      }
    } catch (saveError: any) {
      console.error("Error saving filled PDF:", saveError);
      return NextResponse.json(
        { error: "Failed to save filled PDF", details: saveError.message },
        { status: 500 },
      );
    }

    // Upload the filled PDF to Supabase storage in the correct subsidiary folder
    const timestamp = Date.now();
    const filename =
      formType === "bestellformular"
        ? `Bestellformular_${timestamp}.pdf`
        : `Dokumentationsbogen_${timestamp}.pdf`;

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

    console.log("Uploading filled PDF to:", filePath);

    // Upload the filled PDF to the givve_documents bucket
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

    console.log("Upload successful, generating download URL");

    // Create a signed URL for the filled PDF from the givve_documents bucket with longer expiry
    const { data: signedUrlData, error: signedUrlError } =
      await supabaseClient.storage
        .from("givve_documents")
        .createSignedUrl(filePath, 600); // 10 minutes expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Error creating signed URL:", signedUrlError);
      return NextResponse.json(
        { error: "Failed to create download link", details: signedUrlError },
        { status: 500 },
      );
    }

    console.log("PDF process completed successfully");

    // Set content-disposition header in the response
    return NextResponse.json({
      success: true,
      downloadUrl: signedUrlData.signedUrl,
      filename,
      filePath,
      bucket: "givve_documents",
      fileSize: filledPdfBytes.byteLength,
    });
  } catch (error: any) {
    console.error("Unexpected error in PDF fill API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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

    // Fill in each field if it exists
    for (const [key, value] of Object.entries(fieldValues)) {
      if (fieldMap.has(key)) {
        const fieldType = fieldMap.get(key);

        try {
          if (fieldType === "text") {
            // Handle text fields
            const field = form.getTextField(key);
            field.setText(value);
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
          } else if (fieldType === "radio") {
            // Handle radio button groups
            const field = form.getRadioGroup(key);
            field.select(value);
          } else if (fieldType === "dropdown" || fieldType === "option") {
            // Handle dropdown and option lists
            const field = form.getDropdown(key);
            field.select(value);
          }
        } catch (fieldError) {
          console.warn(
            `Error filling field "${key}" of type "${fieldType}":`,
            fieldError,
          );
        }
      }
    }
  } catch (error) {
    console.error("Error filling PDF form:", error);
    throw new Error("Failed to fill PDF form");
  }
}
