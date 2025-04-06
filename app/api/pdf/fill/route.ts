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
  // Log environment diagnostics
  console.log("=== PDF FILL API ENVIRONMENT DIAGNOSTICS ===");
  console.log(`Node.js version: ${process.version}`);
  console.log(`Runtime: ${process.env.NEXT_RUNTIME || "nodejs"}`);
  console.log(
    `Memory limit: ${process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || "unknown"}`,
  );
  console.log(`Vercel environment: ${process.env.VERCEL_ENV || "development"}`);
  console.log(
    `Region: ${process.env.VERCEL_REGION || process.env.AWS_REGION || "unknown"}`,
  );
  console.log("==========================================");

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
      const isDebugMode = request.nextUrl.searchParams.has("debug");

      // Special handling for Dokumentationsbogen
      if (
        formType === "dokumentationsbogen" &&
        (templatePath.includes("Dokumentationsbogen") ||
          templatePath.includes("dokumentationsbogen"))
      ) {
        console.log("Using specialized Dokumentationsbogen filling approach");
        await fillDokumentationsbogen(
          pdfDoc,
          formData,
          isDebugMode,
          templatePath,
        );
      } else {
        // Regular PDF filling for other forms
        await fillPdfForm(pdfDoc, formData, isDebugMode, templatePath);
      }

      console.log("PDF form filled successfully");
    } catch (fillError: any) {
      console.error("Error filling PDF form with standard method:", fillError);

      // Try alternative filling method if standard fails
      try {
        console.log("Attempting fallback PDF filling method...");
        await fallbackFillPdfForm(pdfDoc, formData);
        console.log("PDF form filled successfully using fallback method");
      } catch (fallbackError: any) {
        console.error(
          "Error filling PDF form with fallback method:",
          fallbackError,
        );

        // If client requests debug mode and all server methods fail, return template for client-side filling
        if (
          request.nextUrl.searchParams.has("debug") &&
          request.nextUrl.searchParams.has("client_fallback")
        ) {
          console.log(
            "Both server methods failed, returning template PDF for client-side filling",
          );

          return NextResponse.json({
            success: false,
            error: "Server-side filling failed",
            details: {
              standard: fillError.message,
              fallback: fallbackError.message,
            },
            templateUrl: fileData.signedUrl, // Return the template URL for client-side filling
            fieldValues: formData, // Return the values that should be filled
          });
        }

        return NextResponse.json(
          {
            error: "Failed to fill PDF form with all methods",
            details: {
              standard: fillError.message,
              fallback: fallbackError.message,
            },
          },
          { status: 500 },
        );
      }
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

    // Add query parameter to the download URL to indicate debugging mode for client
    const isDebugMode = request.nextUrl.searchParams.has("debug");

    console.log(
      "Uploading filled PDF to:",
      filePath,
      isDebugMode ? "(DEBUG MODE)" : "",
    );

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
  isDebugMode: boolean,
  templatePath?: string,
): Promise<void> {
  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Log all form fields present in the PDF
    console.log(`PDF form contains ${fields.length} fields:`);
    fields.forEach((field) => {
      console.log(`Field: ${field.getName()}, Type: ${field.constructor.name}`);
    });

    // On Vercel, field type is often just "e" instead of proper constructor name
    // We'll use a different approach to determine field types
    const isVercelEnvironment = process.env.VERCEL === "1";
    console.log(`Detected Vercel environment: ${isVercelEnvironment}`);

    // Map fields to their types
    const fieldMap = new Map();

    for (const field of fields) {
      const fieldName = field.getName();
      let fieldType = "unknown";

      if (isVercelEnvironment) {
        // In Vercel, we'll try to determine type by field name and behaviors
        // Note: This is a simplistic approach and may need refinement

        // For Dokumentationsbogen, many fields are actually checkboxes
        const isDokumentationsbogen =
          fieldName.toLowerCase().includes("dokument") ||
          templatePath?.toLowerCase().includes("dokumentationsbogen");

        if (
          isDokumentationsbogen &&
          // Business type checkboxes in Dokumentationsbogen
          (fieldName.includes("Land und Forstwirtschaft") ||
            fieldName.includes("Bergbau") ||
            fieldName.includes("Verarbeitendes Gewerbe") ||
            fieldName.includes("Energieversorgung") ||
            fieldName.includes("Wasserversorgung") ||
            fieldName.includes("Baugewerbe") ||
            fieldName.includes("Handel") ||
            fieldName.includes("Verkehr") ||
            fieldName.includes("Gastgewerbe") ||
            fieldName.includes("Information") ||
            fieldName.includes("Erbringung von Finanz") ||
            fieldName.includes("Grundstücks") ||
            fieldName.includes("Erbringung von freiberuflichen") ||
            fieldName.includes("Erbringung von sonstigen") ||
            fieldName.includes("Öffentliche Verwaltung") ||
            fieldName.includes("Erziehung") ||
            fieldName.includes("Gesundheits") ||
            fieldName.includes("Kunst") ||
            fieldName.includes("Private Haushalte") ||
            fieldName.includes("Exterritoriale") ||
            // Legal form checkboxes
            fieldName.includes(
              "Der Vertragspartner führt ein Einzelunternehmen",
            ) ||
            fieldName.includes(
              "Der Vertragspartner führt einen freien Beruf aus",
            ) ||
            fieldName.includes(
              "Der Vertragspartner ist ein eingetragener Kaufmann",
            ) ||
            // Purpose checkboxes
            fieldName.includes("Bereitstellung eines Sachbezugs") ||
            fieldName.includes("bis zu 50 EUR pro Monat") ||
            fieldName.includes("bis zu 60 EUR je persönlichen") ||
            fieldName.includes("Andere Bitte angeben"))
        ) {
          fieldType = "checkbox";
        } else if (
          fieldName.toLowerCase().includes("check") ||
          fieldName === "givve StandardCard" ||
          fieldName === "givve LogoCard" ||
          fieldName === "givve DesignCard" ||
          // Common checkbox patterns in Dokumentationsbogen
          fieldName.toLowerCase().includes("ja") ||
          fieldName.toLowerCase().includes("nein") ||
          fieldName.toLowerCase().includes("yes") ||
          fieldName.toLowerCase().includes("no") ||
          fieldName.toLowerCase().includes("option")
        ) {
          fieldType = "checkbox";
        } else if (
          // Handle dropdown fields in Dokumentationsbogen
          fieldName.toLowerCase().includes("dropdown") ||
          fieldName.toLowerCase().includes("auswahl") ||
          fieldName.toLowerCase().includes("liste")
        ) {
          fieldType = "dropdown";
        } else {
          // Default to text for most fields on Vercel
          fieldType = "text";
        }
      } else {
        // Standard environment - use constructor name
        if (field.constructor.name.includes("PDFTextField")) {
          fieldType = "text";
        } else if (field.constructor.name.includes("PDFCheckBox")) {
          fieldType = "checkbox";
        } else if (field.constructor.name.includes("PDFRadioGroup")) {
          fieldType = "radio";
        } else if (field.constructor.name.includes("PDFDropdown")) {
          fieldType = "dropdown";
        } else if (field.constructor.name.includes("PDFOptionList")) {
          fieldType = "option";
        }
      }

      fieldMap.set(fieldName, fieldType);
      console.log(`Mapped field "${fieldName}" to type "${fieldType}"`);
    }

    // Log all field values we're trying to fill
    console.log("Attempting to fill the following fields:");
    Object.entries(fieldValues).forEach(([key, value]) => {
      const fieldType = fieldMap.has(key)
        ? fieldMap.get(key)
        : "not found in form";
      console.log(
        `Will try to fill: ${key} (${fieldType}) with value: ${value}`,
      );
    });

    // Count for statistics
    let filledFields = 0;
    let skippedFields = 0;
    let errorFields = 0;

    // Check if this is a Dokumentationsbogen
    const isDokumentationsbogen =
      fields.some(
        (field) =>
          field.getName().toLowerCase().includes("dokument") ||
          field.getName().toLowerCase().includes("geldwäsche"),
      ) || templatePath?.toLowerCase().includes("dokumentationsbogen");

    if (isDokumentationsbogen) {
      console.log("Detected Dokumentationsbogen form in primary method");
    }

    // Fill in each field if it exists
    for (const [key, value] of Object.entries(fieldValues)) {
      try {
        if (fieldMap.has(key)) {
          const fieldType = fieldMap.get(key);
          console.log(`Processing field: ${key} (${fieldType}) = "${value}"`);

          try {
            if (fieldType === "text") {
              // Handle text fields
              const field = form.getTextField(key);
              field.setText(value);
              console.log(`✅ Successfully filled text field: ${key}`);
              filledFields++;
            } else if (fieldType === "checkbox") {
              // Handle checkbox fields
              const field = form.getCheckBox(key);
              if (
                value.toLowerCase() === "yes" ||
                value === "true" ||
                value === "1"
              ) {
                field.check();
                console.log(`✅ Successfully checked checkbox: ${key}`);
              } else {
                field.uncheck();
                console.log(`✅ Successfully unchecked checkbox: ${key}`);
              }
              filledFields++;
            } else if (fieldType === "radio") {
              // Handle radio button groups
              const field = form.getRadioGroup(key);
              field.select(value);
              console.log(
                `✅ Successfully selected radio option: ${key} = ${value}`,
              );
              filledFields++;
            } else if (fieldType === "dropdown" || fieldType === "option") {
              // Handle dropdown and option lists
              const field = form.getDropdown(key);
              field.select(value);
              console.log(
                `✅ Successfully selected dropdown option: ${key} = ${value}`,
              );
              filledFields++;
            } else {
              console.log(
                `⚠️ Skipping unknown field type: ${key} (${fieldType})`,
              );
              skippedFields++;
            }
          } catch (fieldError: any) {
            console.warn(
              `❌ Error filling field "${key}" of type "${fieldType}":`,
              fieldError.message || fieldError,
            );
            errorFields++;
          }
        } else {
          console.log(`⚠️ Field not found in PDF: ${key}`);
          skippedFields++;
        }
      } catch (individualFieldError: any) {
        console.error(
          `❌ Unexpected error processing field ${key}:`,
          individualFieldError.message || individualFieldError,
        );
        errorFields++;
      }
    }

    // For Dokumentationsbogen, add special handling for problematic fields
    if (
      isDokumentationsbogen &&
      isVercelEnvironment &&
      filledFields < Object.keys(fieldValues).length / 2
    ) {
      console.log("Adding special handling for Dokumentationsbogen fields");

      // Get all field names
      const fieldNames = fields.map((f) => f.getName());

      // Handle checkboxes for business types and legal form fields
      const businessTypeFields = [
        "Land und Forstwirtschaft Fischerei",
        "Bergbau und Gewinnung von Steinen und Erden",
        "Verarbeitendes Gewerbe",
        "Energieversorgung",
        "Wasserversorgung Abwasser und Abfallentsorgung",
        "Baugewerbe",
        "Handel Instandhaltung und Reparatur von",
        "Verkehr und Lagerei",
        "Gastgewerbe",
        "Information und Kommunikation",
        "Erbringung von Finanz und Versicherungs",
        "Grundstücks und Wohnungswesen",
        "Erbringung von freiberuflichen wissenschaftlichen",
        "Erbringung von sonstigen wirtschaftlichen",
        "Öffentliche Verwaltung Verteidigung",
        "Erziehung und Unterricht",
        "Gesundheits und Sozialwesen",
        "Kunst Unterhaltung und Erholung",
        "Erbringung von sonstigen Dienstleistungen",
        "Private Haushalte mit Hauspersonal Herstellung",
        "Exterritoriale Organisationen und Körperschaften",
      ];

      const legalFormFields = [
        "Der Vertragspartner führt ein Einzelunternehmen",
        "Der Vertragspartner führt einen freien Beruf aus",
        "Der Vertragspartner ist ein eingetragener Kaufmann eK",
      ];

      const purposeFields = [
        "Bereitstellung eines Sachbezugs für voraussichtlich",
        "bis zu 50 EUR pro Monat nach  8 Abs 2 Satz 11 EStG steuerfreier Sachbezug",
        "bis zu 60 EUR je persönlichen Anlass nach R 196 Abs 1 LStR Aufmerksamkeiten",
        "Andere Bitte angeben",
      ];

      const allCheckboxFields = [
        ...businessTypeFields,
        ...legalFormFields,
        ...purposeFields,
      ];

      for (const checkboxField of allCheckboxFields) {
        if (fieldNames.includes(checkboxField) && fieldValues[checkboxField]) {
          try {
            const field = form.getField(checkboxField);
            const isYesValue =
              fieldValues[checkboxField].toLowerCase() === "yes" ||
              fieldValues[checkboxField] === "true" ||
              fieldValues[checkboxField] === "1";

            if (isYesValue) {
              try {
                // Try both methods
                try {
                  (field as any).check();
                } catch (e) {
                  // If check fails, try setValue
                  (field as any).setValue("Yes");
                }
                console.log(
                  `✅ Special handler: Checked field ${checkboxField}`,
                );
                filledFields++;
              } catch (e) {
                console.error(`Failed to check field ${checkboxField}:`, e);
              }
            }
          } catch (e) {
            // Field not found or not accessible
          }
        }
      }
    }

    console.log(
      `Form filling summary: ${filledFields} fields filled, ${skippedFields} fields skipped, ${errorFields} errors`,
    );

    if (filledFields === 0 && isVercelEnvironment) {
      console.log("No fields filled, attempting emergency direct approach");

      // Try to identify potential radio groups first (common in Dokumentationsbogen)
      // Get all field names
      const fieldNames = fields.map((f) => f.getName());

      // Look for patterns in field names that might indicate radio button groups
      const radioGroupCandidates = new Set<string>();
      fieldNames.forEach((name) => {
        // Look for common radio group patterns like multiple fields with similar names
        // e.g., option1, option2, option3 or field_1, field_2, field_3
        const match = name.match(/(.*?)[\d_]+$/);
        if (match) {
          radioGroupCandidates.add(match[1]);
        }
      });

      console.log(
        `Found ${radioGroupCandidates.size} potential radio group bases`,
      );

      // Try to handle radio groups specifically
      for (const [key, value] of Object.entries(fieldValues)) {
        for (const groupBase of radioGroupCandidates) {
          if (key.startsWith(groupBase) || key.includes(groupBase)) {
            console.log(
              `Trying to handle ${key} as part of radio group ${groupBase}`,
            );

            // For each matching group, find all related fields
            const relatedFields = fieldNames.filter(
              (name) => name.startsWith(groupBase) || name.includes(groupBase),
            );

            console.log(
              `Found ${relatedFields.length} fields in potential group ${groupBase}`,
            );

            try {
              // Try to select the appropriate option
              for (const fieldName of relatedFields) {
                try {
                  const field = form.getField(fieldName);
                  // If this specific field matches our desired value
                  if (
                    fieldName.toLowerCase().includes(value.toLowerCase()) ||
                    (typeof value === "string" &&
                      value.toLowerCase() === "yes" &&
                      (fieldName.toLowerCase().includes("ja") ||
                        fieldName.toLowerCase().includes("yes")))
                  ) {
                    try {
                      (field as any).check();
                      console.log(
                        `✅ Emergency radio approach: Checked ${fieldName} for value ${value}`,
                      );
                      filledFields++;
                      break; // Found our match
                    } catch (e) {
                      // Not a checkbox, ignore
                    }
                  }
                } catch (e) {
                  // Ignore individual field errors
                }
              }
            } catch (e) {
              // Ignore group errors
            }
          }
        }
      }

      // Last resort: Try a more direct approach for Vercel
      for (const [key, value] of Object.entries(fieldValues)) {
        try {
          // Skip empty values
          if (!value) continue;

          // Try to get field by name directly
          const field = form.getField(key);
          if (!field) continue;

          // Force type assertion and call setText
          try {
            (field as any).setText(value);
            console.log(`✅ Emergency approach: Set text for ${key}`);
            filledFields++;
          } catch (e) {
            // If setText fails, try one more approach with check/select
            try {
              if (key.includes("Card") && value.toLowerCase() === "yes") {
                (field as any).check();
                console.log(`✅ Emergency approach: Checked ${key}`);
                filledFields++;
              }
            } catch (e2) {
              // Give up on this field
            }
          }
        } catch (e) {
          // Ignore errors in emergency mode
        }
      }
      console.log(`Emergency approach results: ${filledFields} fields filled`);
    }

    if (filledFields === 0) {
      throw new Error("Failed to fill any fields in the PDF");
    }
  } catch (error: any) {
    console.error("Error in fillPdfForm function:", error.message || error);
    throw new Error(`Failed to fill PDF form: ${error.message || error}`);
  }
}

// Fallback PDF Filling Helper Function
async function fallbackFillPdfForm(
  pdfDoc: PDFDocument,
  fieldValues: Record<string, string>,
): Promise<void> {
  try {
    console.log("Using fallback PDF filling method");
    const form = pdfDoc.getForm();

    // Get all fields directly from the form
    const fields = form.getFields();
    console.log(`Fallback: Found ${fields.length} fields in the PDF`);

    // Try all possible fields without relying on type checking
    let filledCount = 0;
    let errorCount = 0;

    // Get field names for analysis
    const fieldNames = fields.map((f) => f.getName());
    console.log("All field names:", fieldNames);

    // Analyze fields to determine what type of form we're dealing with
    const isDokumentationsbogen = fieldNames.some(
      (name) =>
        name.toLowerCase().includes("dokument") ||
        name.toLowerCase().includes("geldwäsche") ||
        name.toLowerCase().includes("wirtschaftlich") ||
        name.toLowerCase().includes("identifizierung") ||
        // Add common Dokumentationsbogen fields
        name.includes("Land und Forstwirtschaft") ||
        name.includes("Bereitstellung eines Sachbezugs") ||
        name.includes("Der Vertragspartner führt"),
    );

    if (isDokumentationsbogen) {
      console.log(
        "Detected Dokumentationsbogen form, using specialized approach",
      );

      // Enhanced list of potential checkbox candidates for Dokumentationsbogen
      const checkboxCandidates = [
        ...fieldNames.filter(
          (name) =>
            name.toLowerCase().includes("ja") ||
            name.toLowerCase().includes("nein") ||
            name.toLowerCase().includes("yes") ||
            name.toLowerCase().includes("no"),
        ),
        // Add business types as checkbox candidates
        ...fieldNames.filter(
          (name) =>
            name.includes("Land und Forstwirtschaft") ||
            name.includes("Bergbau") ||
            name.includes("Verarbeitendes Gewerbe") ||
            name.includes("Energieversorgung") ||
            name.includes("Wasserversorgung") ||
            name.includes("Baugewerbe") ||
            name.includes("Handel") ||
            name.includes("Verkehr") ||
            name.includes("Gastgewerbe") ||
            name.includes("Information") ||
            name.includes("Erbringung") ||
            name.includes("Grundstücks") ||
            name.includes("Öffentliche") ||
            name.includes("Erziehung") ||
            name.includes("Gesundheits") ||
            name.includes("Kunst") ||
            name.includes("Private") ||
            name.includes("Exterritoriale"),
        ),
        // Add legal form checkboxes
        ...fieldNames.filter(
          (name) =>
            name.includes("Der Vertragspartner führt") ||
            name.includes("Der Vertragspartner ist"),
        ),
        // Add purpose checkboxes
        ...fieldNames.filter(
          (name) =>
            name.includes("Bereitstellung eines Sachbezugs") ||
            name.includes("bis zu 50 EUR") ||
            name.includes("bis zu 60 EUR") ||
            name.includes("Andere Bitte angeben"),
        ),
      ];

      console.log(
        `Found ${checkboxCandidates.length} potential checkbox fields`,
      );

      // First, handle all explicitly specified checkboxes by field name
      for (const [key, value] of Object.entries(fieldValues)) {
        if (checkboxCandidates.includes(key)) {
          try {
            const field = form.getField(key);
            const isYesValue =
              value.toLowerCase() === "yes" ||
              value.toLowerCase() === "ja" ||
              value.toLowerCase() === "true" ||
              value === "1";

            try {
              if (isYesValue) {
                (field as any).check();
                console.log(`✅ Fallback: Checked checkbox ${key}`);
              } else {
                (field as any).uncheck();
                console.log(`✅ Fallback: Unchecked checkbox ${key}`);
              }
              filledCount++;
              continue; // Skip to next field
            } catch (e) {
              // Not a checkbox or failed, continue with other methods
            }
          } catch (e) {
            // Field not found, continue
          }
        }
      }
    }

    // Continue with standard fallback methods
    // Method 1: Direct access by field name
    console.log("Fallback Method 1: Direct access by field name");
    for (const [key, value] of Object.entries(fieldValues)) {
      try {
        // Try to get the field by name and set text regardless of type
        const field = form.getField(key);

        if (field) {
          console.log(`Fallback: Found field "${key}", attempting to fill`);

          // Just try setText - it might work for most fields
          if (typeof (field as any).setText === "function") {
            (field as any).setText(value);
            console.log(`Fallback: Successfully set text for field "${key}"`);
            filledCount++;
          }
          // If setText doesn't exist or work, try specific field types
          else {
            console.log(
              `Fallback: setText not available for "${key}", trying specific methods`,
            );

            // Try different field types
            try {
              const textField = form.getTextField(key);
              textField.setText(value);
              console.log(`Fallback: Successfully set text field "${key}"`);
              filledCount++;
            } catch (e) {
              try {
                const checkBox = form.getCheckBox(key);
                if (
                  value.toLowerCase() === "yes" ||
                  value === "true" ||
                  value === "1"
                ) {
                  checkBox.check();
                } else {
                  checkBox.uncheck();
                }
                console.log(`Fallback: Successfully set checkbox "${key}"`);
                filledCount++;
              } catch (e) {
                try {
                  const radioGroup = form.getRadioGroup(key);
                  radioGroup.select(value);
                  console.log(
                    `Fallback: Successfully set radio group "${key}"`,
                  );
                  filledCount++;
                } catch (e) {
                  try {
                    const dropdown = form.getDropdown(key);
                    dropdown.select(value);
                    console.log(`Fallback: Successfully set dropdown "${key}"`);
                    filledCount++;
                  } catch (e) {
                    console.log(
                      `Fallback: Could not set field "${key}" with any method`,
                    );
                    errorCount++;
                  }
                }
              }
            }
          }
        } else {
          console.log(`Fallback: Field "${key}" not found in form`);
        }
      } catch (error: any) {
        console.error(
          `Fallback: Error setting field "${key}":`,
          error.message || error,
        );
        errorCount++;
      }
    }

    // Method 2: Try to find fields by partial name match
    console.log("Fallback Method 2: Partial name matching");
    // Use existing fieldNames array - no need to redefine

    for (const [key, value] of Object.entries(fieldValues)) {
      // Skip if already filled successfully
      if (fieldNames.includes(key)) continue;

      // Look for partial matches
      const possibleMatches = fieldNames.filter(
        (name) =>
          name.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(name.toLowerCase()),
      );

      if (possibleMatches.length > 0) {
        console.log(
          `Fallback: Found ${possibleMatches.length} potential matches for "${key}"`,
        );

        // Try each potential match
        for (const matchName of possibleMatches) {
          try {
            const field = form.getField(matchName);
            if (typeof (field as any).setText === "function") {
              (field as any).setText(value);
              console.log(
                `Fallback: Successfully set text for partial match "${matchName}" (for "${key}")`,
              );
              filledCount++;
              break; // Stop after first successful match
            }
          } catch (error) {
            // Continue to next match
          }
        }
      }
    }

    console.log(
      `Fallback filling summary: ${filledCount} fields filled, ${errorCount} errors`,
    );

    if (filledCount === 0) {
      throw new Error("Fallback method couldn't fill any fields");
    }
  } catch (error: any) {
    console.error("Error in fallbackFillPdfForm:", error.message || error);
    throw new Error(`Fallback PDF filling failed: ${error.message || error}`);
  }
}

// Add specialized Dokumentationsbogen filling function
async function fillDokumentationsbogen(
  pdfDoc: PDFDocument,
  fieldValues: Record<string, string>,
  isDebugMode: boolean,
  templatePath?: string,
): Promise<void> {
  try {
    console.log("Using dedicated Dokumentationsbogen filling method");
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Log all fields
    console.log(`Dokumentationsbogen form contains ${fields.length} fields`);
    fields.forEach((field) => {
      console.log(`Field: ${field.getName()}`);
    });

    // Fill text fields first - these usually work fine
    const textFields = [
      "Vornamen und Nachname",
      "Geburtsdatum",
      "Geburtsort",
      "Staatsangehörigkeit",
      "Wohnanschrift",
      "EMail Adresse",
      "Registernummer nur bei eK",
      "Person, Amt",
      "Mitarbeiter",
      "Andere",
      "Ort, Datum, Unterschrift",
    ];

    // Fill text fields
    for (const fieldName of textFields) {
      if (fieldValues[fieldName]) {
        try {
          const field = form.getTextField(fieldName);
          field.setText(fieldValues[fieldName]);
          console.log(
            `✅ Set text field: ${fieldName} = ${fieldValues[fieldName]}`,
          );
        } catch (e) {
          console.log(`❌ Failed to set text field: ${fieldName}`);
        }
      }
    }

    // Handle standard checkboxes
    const checkboxFields = [
      "Nein",
      "Ja folgende Person folgendes Amt",
      "bis zu 10000 EUR pro Jahr nach  37b EStG pauschalversteurter Sachbezug",
    ];

    // Fill standard checkboxes
    for (const fieldName of checkboxFields) {
      if (fieldValues[fieldName]) {
        try {
          const field = form.getCheckBox(fieldName);
          const isYesValue =
            fieldValues[fieldName].toLowerCase() === "yes" ||
            fieldValues[fieldName] === "true" ||
            fieldValues[fieldName] === "1";

          if (isYesValue) {
            field.check();
            console.log(`✅ Checked checkbox: ${fieldName}`);
          } else {
            field.uncheck();
            console.log(`✅ Unchecked checkbox: ${fieldName}`);
          }
        } catch (e) {
          console.log(`❌ Failed to set checkbox: ${fieldName}`);
        }
      }
    }

    // Handle special fields by direct field approach
    const specialFields = [
      // Legal form
      "Der Vertragspartner führt ein Einzelunternehmen",
      "Der Vertragspartner führt einen freien Beruf aus",
      "Der Vertragspartner ist ein eingetragener Kaufmann eK",
      // Business types
      "Land und Forstwirtschaft Fischerei",
      "Bergbau und Gewinnung von Steinen und Erden",
      "Verarbeitendes Gewerbe",
      "Energieversorgung",
      "Wasserversorgung Abwasser und Abfallentsorgung",
      "Baugewerbe",
      "Handel Instandhaltung und Reparatur von",
      "Verkehr und Lagerei",
      "Gastgewerbe",
      "Information und Kommunikation",
      "Erbringung von Finanz und Versicherungs",
      "Grundstücks und Wohnungswesen",
      "Erbringung von freiberuflichen wissenschaftlichen",
      "Erbringung von sonstigen wirtschaftlichen",
      "Öffentliche Verwaltung Verteidigung",
      "Erziehung und Unterricht",
      "Gesundheits und Sozialwesen",
      "Kunst Unterhaltung und Erholung",
      "Erbringung von sonstigen Dienstleistungen",
      "Private Haushalte mit Hauspersonal Herstellung",
      "Exterritoriale Organisationen und Körperschaften",
      // Purpose fields
      "Bereitstellung eines Sachbezugs für voraussichtlich",
      "bis zu 50 EUR pro Monat nach  8 Abs 2 Satz 11 EStG steuerfreier Sachbezug",
      "bis zu 60 EUR je persönlichen Anlass nach R 196 Abs 1 LStR Aufmerksamkeiten",
      "Andere Bitte angeben",
    ];

    // Try multiple methods for special fields
    for (const fieldName of specialFields) {
      if (fieldValues[fieldName]) {
        try {
          const field = form.getField(fieldName);
          const isYesValue =
            fieldValues[fieldName].toLowerCase() === "yes" ||
            fieldValues[fieldName] === "true" ||
            fieldValues[fieldName] === "1";

          if (isYesValue) {
            // Try multiple methods for compatibility with different PDF libraries
            try {
              // Method 1: Check as checkbox
              try {
                (field as any).check();
                console.log(`✅ Method 1: Checked ${fieldName}`);
                continue;
              } catch (e) {
                // Not a checkbox, try next method
              }

              // Method 2: Set as text
              try {
                (field as any).setText("Yes");
                console.log(`✅ Method 2: Set text for ${fieldName}`);
                continue;
              } catch (e) {
                // Not a text field, try next method
              }

              // Method 3: setValue for button fields
              try {
                (field as any).setValue("Yes");
                console.log(`✅ Method 3: Set value for ${fieldName}`);
                continue;
              } catch (e) {
                // Not a button field, try next method
              }

              // Method 4: Select for radio groups
              try {
                (field as any).select("Yes");
                console.log(`✅ Method 4: Selected for ${fieldName}`);
                continue;
              } catch (e) {
                // Failed all methods
                console.log(`❌ All methods failed for ${fieldName}`);
              }
            } catch (eMethod) {
              // General method error
              console.log(`❌ Method error for ${fieldName}: ${eMethod}`);
            }
          }
        } catch (e) {
          // Field not found or not accessible
          console.log(`❌ Field not found: ${fieldName}`);
        }
      }
    }

    // If nothing was filled, throw an error to try fallback method
    let filledFieldsCount = 0;

    // Try to check filled fields in a more compatible way
    for (const field of form.getFields()) {
      try {
        // Try different methods to see if a field has value
        try {
          // For text fields
          const textField = field as any;
          if (textField.getText && textField.getText() !== "") {
            filledFieldsCount++;
            continue;
          }
        } catch (e) {
          // Not a text field
        }

        try {
          // For checkboxes
          const checkboxField = field as any;
          if (checkboxField.isChecked && checkboxField.isChecked()) {
            filledFieldsCount++;
            continue;
          }
        } catch (e) {
          // Not a checkbox
        }

        try {
          // For dropdown/choice fields
          const choiceField = field as any;
          if (choiceField.getSelected && choiceField.getSelected().length > 0) {
            filledFieldsCount++;
            continue;
          }
        } catch (e) {
          // Not a choice field
        }
      } catch (e) {
        // Skip fields that can't be checked
      }
    }

    console.log(
      `Filled approximately ${filledFieldsCount} fields in Dokumentationsbogen`,
    );

    if (filledFieldsCount === 0) {
      throw new Error("Could not fill any fields in Dokumentationsbogen");
    }
  } catch (error: any) {
    console.error("Error in fillDokumentationsbogen:", error.message || error);
    throw new Error(
      `Dokumentationsbogen filling failed: ${error.message || error}`,
    );
  }
}
