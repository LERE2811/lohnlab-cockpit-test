import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@/utils/supabase/server";
import {
  GivveDocumentType,
  GivveDocumentCategory,
} from "@/app/constants/givveDocumentTypes";

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabaseClient = await createClient();

    // Parse request body
    const body = await request.json();
    const { formType, templatePath, formData, subsidiaryId } = body;

    if (!formType || !templatePath || !formData || !subsidiaryId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Generate a signed URL for the template PDF
    const { data: fileData, error: fileError } = await supabaseClient.storage
      .from("givve_documents")
      .createSignedUrl(templatePath, 60);

    if (fileError || !fileData?.signedUrl) {
      console.error("Error getting template file:", fileError);
      return NextResponse.json(
        { error: "Failed to access template file" },
        { status: 500 },
      );
    }

    // Fetch the PDF template
    const response = await fetch(fileData.signedUrl);
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Fill the PDF form
    await fillPdfForm(pdfDoc, formData);

    // Save the filled PDF
    const filledPdfBytes = await pdfDoc.save();

    // Upload the filled PDF to Supabase storage in the correct subsidiary folder
    const timestamp = Date.now();
    const filename =
      formType === "bestellformular"
        ? `Bestellformular_${timestamp}.pdf`
        : `Dokumentationsbogen_${timestamp}.pdf`;

    // Define path according to file organization strategy from file-organization.md:
    // givve_documents/{subsidiary_id}/legal_form_documents/{document_type}/{timestamp}_{filename}

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
        { error: "Failed to save filled PDF" },
        { status: 500 },
      );
    }

    // Create a signed URL for the filled PDF from the givve_documents bucket
    const { data: signedUrlData, error: signedUrlError } =
      await supabaseClient.storage
        .from("givve_documents")
        .createSignedUrl(filePath, 300); // 5 minutes expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Error creating signed URL:", signedUrlError);
      return NextResponse.json(
        { error: "Failed to create download link" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrlData.signedUrl,
      filename,
      filePath,
      bucket: "givve_documents",
    });
  } catch (error) {
    console.error("Error in PDF fill API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
