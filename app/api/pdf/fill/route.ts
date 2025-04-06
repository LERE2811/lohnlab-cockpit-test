import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@/utils/supabase/server";
import { PdfFormFiller } from "./utils/pdf-form-filler";
import { DokumentationsbogenFiller } from "./utils/dokumentationsbogen-filler";
import { StorageManager } from "./utils/storage-manager";

// Force Node.js runtime for pdf-lib compatibility
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabaseClient = await createClient();
    const storageManager = new StorageManager(supabaseClient);

    // Parse request body
    const body = await request.json();
    const { formType, templatePath, formData, subsidiaryId } = body;

    if (!formType || !templatePath || !formData || !subsidiaryId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Get template URL
    let templateUrl;
    try {
      templateUrl = await storageManager.getTemplateUrl(templatePath);
    } catch (error: any) {
      return NextResponse.json(
        { error: "Failed to access template file", details: error.message },
        { status: 500 },
      );
    }

    // Fetch the PDF template
    let pdfBytes;
    try {
      const response = await fetch(templateUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch template: ${response.status} ${response.statusText}`,
        );
      }

      pdfBytes = await response.arrayBuffer();

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

    // Load the PDF document
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(pdfBytes);
    } catch (loadError: any) {
      console.error("Error loading PDF document:", loadError);
      return NextResponse.json(
        { error: "Failed to load PDF document", details: loadError.message },
        { status: 500 },
      );
    }

    // Fill the PDF form
    const isDebugMode = request.nextUrl.searchParams.has("debug");
    let pdfFiller: PdfFormFiller;

    // Create appropriate filler based on form type
    if (
      formType === "dokumentationsbogen" &&
      (templatePath.includes("Dokumentationsbogen") ||
        templatePath.includes("dokumentationsbogen"))
    ) {
      pdfFiller = new DokumentationsbogenFiller(
        pdfDoc,
        isDebugMode,
        templatePath,
      );
    } else {
      pdfFiller = new PdfFormFiller(pdfDoc, isDebugMode, templatePath);
    }

    try {
      await pdfFiller.fillForm(formData);
    } catch (fillError: any) {
      console.error("Error filling PDF form:", fillError);

      // If client requests debug mode and server-side filling fails, return template for client-side filling
      if (
        request.nextUrl.searchParams.has("debug") &&
        request.nextUrl.searchParams.has("client_fallback")
      ) {
        return NextResponse.json({
          success: false,
          error: "Server-side filling failed",
          details: fillError.message,
          templateUrl,
          fieldValues: formData,
        });
      }

      return NextResponse.json(
        { error: "Failed to fill PDF form", details: fillError.message },
        { status: 500 },
      );
    }

    // Save the filled PDF
    let filledPdfBytes;
    try {
      filledPdfBytes = await pdfDoc.save();

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

    // Save the filled PDF and get download URL
    try {
      const result = await storageManager.saveFilledPdf(
        filledPdfBytes,
        formType,
        subsidiaryId,
      );

      return NextResponse.json({
        success: true,
        ...result,
      });
    } catch (storageError: any) {
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 },
      );
    }
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
