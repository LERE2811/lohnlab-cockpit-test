import { SupabaseClient } from "@supabase/supabase-js";
import {
  GivveDocumentType,
  GivveDocumentCategory,
} from "@/app/constants/givveDocumentTypes";

export interface StorageResult {
  downloadUrl: string;
  filename: string;
  filePath: string;
  bucket: string;
  fileSize: number;
}

export class StorageManager {
  private supabaseClient: SupabaseClient;
  private bucket: string = "givve_documents";

  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async getTemplateUrl(templatePath: string): Promise<string> {
    const { data: fileData, error: fileError } =
      await this.supabaseClient.storage
        .from(this.bucket)
        .createSignedUrl(templatePath, 300); // 5 minutes expiry for cold starts

    if (fileError || !fileData?.signedUrl) {
      console.error("Error getting template file:", fileError);
      throw new Error("Failed to access template file");
    }

    return fileData.signedUrl;
  }

  async saveFilledPdf(
    pdfBytes: Uint8Array,
    formType: string,
    subsidiaryId: string,
  ): Promise<StorageResult> {
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

    // Upload the filled PDF
    const { error: uploadError } = await this.supabaseClient.storage
      .from(this.bucket)
      .upload(filePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading filled PDF:", uploadError);
      throw new Error("Failed to save filled PDF");
    }

    // Create a signed URL for the filled PDF
    const { data: signedUrlData, error: signedUrlError } =
      await this.supabaseClient.storage
        .from(this.bucket)
        .createSignedUrl(filePath, 600); // 10 minutes expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Error creating signed URL:", signedUrlError);
      throw new Error("Failed to create download link");
    }

    return {
      downloadUrl: signedUrlData.signedUrl,
      filename,
      filePath,
      bucket: this.bucket,
      fileSize: pdfBytes.byteLength,
    };
  }
}
