import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function GET(request: NextRequest) {
  console.log("PDF test API called");

  try {
    // Test creating a simple PDF document
    console.log("Creating PDF document...");
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 700]);
    page.drawText("PDF-lib is working on Vercel!", {
      x: 50,
      y: 650,
      size: 16,
    });

    console.log("Saving PDF...");
    const pdfBytes = await pdfDoc.save();
    console.log("PDF created successfully with size:", pdfBytes.byteLength);

    return NextResponse.json({
      success: true,
      message: "PDF-lib is working!",
      bytesSize: pdfBytes.byteLength,
    });
  } catch (error) {
    console.error("Error in PDF test API:", error);
    // Log stack trace if available
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: "PDF-lib error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
