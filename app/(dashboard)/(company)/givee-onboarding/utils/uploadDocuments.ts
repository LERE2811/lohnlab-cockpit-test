import { supabase } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

// Define a custom File type to use directly within this file
type CustomFile = File & {
  name: string;
  size: number;
  type: string;
};

/**
 * File metadata interface for uploaded documents
 */
export interface DocumentFileMetadata {
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  signedUrl: string;
}

/**
 * Enum of document categories used in the Givve onboarding process
 */
export enum GivveDocumentCategory {
  LEGAL_FORM_DOCUMENTS = "legal_form_documents",
  SIGNED_FORMS = "signed_forms",
  IDENTIFICATION_DOCUMENTS = "identification_documents",
  ADDITIONAL_DOCUMENTS = "additional_documents",
  LOGOS = "logos",
  DESIGN_FILES = "design_files",
}

/**
 * Enum of specific document types within categories
 */
export enum GivveDocumentType {
  // Signed forms
  BESTELLFORMULAR = "bestellformular",
  DOKUMENTATIONSBOGEN = "dokumentationsbogen",

  // Legal form specific documents will use the document key from the respective form
  // e.g., "gewerbeanmeldungenFiles", "gesellschaftsvertragFile", etc.

  // Additional documents
  POWER_OF_ATTORNEY = "power_of_attorney",
  OTHER = "other",
}

/**
 * Uploads a file to Supabase storage in the givve_documents bucket
 * using a consistent folder structure
 *
 * @param file The file to upload
 * @param subsidiaryId The ID of the subsidiary this file belongs to
 * @param category The document category (from GivveDocumentCategory enum)
 * @param type The specific document type within the category
 * @returns Document metadata if successful, null otherwise
 */
export const uploadGivveDocument = async (
  file: CustomFile,
  subsidiaryId: string,
  category: GivveDocumentCategory,
  type: string,
): Promise<DocumentFileMetadata | null> => {
  if (!file || !subsidiaryId) {
    console.error("Missing required parameters for file upload");
    return null;
  }

  try {
    // Create a unique filename to avoid conflicts
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace special chars with underscores
      .replace(/_{2,}/g, "_"); // Replace multiple underscores with a single one

    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;

    // Create a consistent folder path structure
    // format: subsidiaryId/category/type/filename
    const filePath = `${subsidiaryId}/${category}/${type}/${uniqueFileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from("givve_documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }

    // Generate a signed URL for the uploaded file (valid for 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from("givve_documents")
      .createSignedUrl(filePath, 3600);

    if (urlError) {
      console.error("Error generating signed URL:", urlError);
      throw urlError;
    }

    if (!urlData?.signedUrl) {
      throw new Error("Failed to generate signed URL");
    }

    // Return the file metadata
    return {
      fileName: file.name,
      filePath: filePath,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      signedUrl: urlData.signedUrl,
    };
  } catch (error) {
    console.error("Error in uploadGivveDocument:", error);
    return null;
  }
};

/**
 * Uploads multiple files for a signed form (Bestellformular or Dokumentationsbogen)
 *
 * @param bestellformularFile The signed Bestellformular file
 * @param dokumentationsbogenFile The signed Dokumentationsbogen file
 * @param subsidiaryId The ID of the subsidiary
 * @returns Object with metadata for both uploaded files if successful
 */
export const uploadSignedForms = async (
  bestellformularFile: File | null,
  dokumentationsbogenFile: File | null,
  subsidiaryId: string,
): Promise<{
  bestellformular?: DocumentFileMetadata;
  dokumentationsbogen?: DocumentFileMetadata;
} | null> => {
  if (!subsidiaryId) {
    console.error("Missing subsidiary ID for signed forms upload");
    return null;
  }

  if (!bestellformularFile && !dokumentationsbogenFile) {
    console.error("No files provided for upload");
    return null;
  }

  try {
    const results: {
      bestellformular?: DocumentFileMetadata;
      dokumentationsbogen?: DocumentFileMetadata;
    } = {};

    // Upload Bestellformular if provided
    if (bestellformularFile) {
      const bestellformularResult = await uploadGivveDocument(
        bestellformularFile as CustomFile,
        subsidiaryId,
        GivveDocumentCategory.SIGNED_FORMS,
        GivveDocumentType.BESTELLFORMULAR,
      );

      if (bestellformularResult) {
        results.bestellformular = bestellformularResult;
      }
    }

    // Upload Dokumentationsbogen if provided
    if (dokumentationsbogenFile) {
      const dokumentationsbogenResult = await uploadGivveDocument(
        dokumentationsbogenFile as CustomFile,
        subsidiaryId,
        GivveDocumentCategory.SIGNED_FORMS,
        GivveDocumentType.DOKUMENTATIONSBOGEN,
      );

      if (dokumentationsbogenResult) {
        results.dokumentationsbogen = dokumentationsbogenResult;
      }
    }

    // Update subsidiary record with signed documents path
    if (Object.keys(results).length > 0) {
      const { error: updateError } = await supabase
        .from("subsidiaries")
        .update({
          givve_signed_documents_path: `${subsidiaryId}/${GivveDocumentCategory.SIGNED_FORMS}`,
          givve_documents_submitted: true,
        })
        .eq("id", subsidiaryId);

      if (updateError) {
        console.error("Error updating subsidiary record:", updateError);
      }
    }

    return Object.keys(results).length > 0 ? results : null;
  } catch (error) {
    console.error("Error uploading signed forms:", error);
    return null;
  }
};

/**
 * Uploads legal form specific documents
 *
 * @param files Object mapping document keys to file arrays
 * @param subsidiaryId The ID of the subsidiary
 * @param legalForm The legal form of the subsidiary (e.g., GmbH, AG)
 * @returns Object with metadata for all uploaded files grouped by document key
 */
export const uploadLegalFormDocuments = async (
  files: { [key: string]: CustomFile[] },
  subsidiaryId: string,
  legalForm: string,
): Promise<{ [key: string]: DocumentFileMetadata[] } | null> => {
  if (!subsidiaryId || !legalForm) {
    console.error("Missing subsidiary ID or legal form");
    return null;
  }

  if (Object.keys(files).length === 0) {
    console.error("No files provided for upload");
    return null;
  }

  try {
    const results: { [key: string]: DocumentFileMetadata[] } = {};

    // Process each document type
    for (const [docKey, fileArray] of Object.entries(files)) {
      if (!fileArray.length) continue;

      const uploadedFiles: DocumentFileMetadata[] = [];

      // Upload each file for this document type
      for (const file of fileArray) {
        const uploadResult = await uploadGivveDocument(
          file,
          subsidiaryId,
          GivveDocumentCategory.LEGAL_FORM_DOCUMENTS,
          docKey,
        );

        if (uploadResult) {
          uploadedFiles.push(uploadResult);
        }
      }

      if (uploadedFiles.length > 0) {
        results[docKey] = uploadedFiles;
      }
    }

    // Update subsidiary record with legal documents path
    if (Object.keys(results).length > 0) {
      const { error: updateError } = await supabase
        .from("subsidiaries")
        .update({
          givve_legal_documents_path: `${subsidiaryId}/${GivveDocumentCategory.LEGAL_FORM_DOCUMENTS}`,
        })
        .eq("id", subsidiaryId);

      if (updateError) {
        console.error("Error updating subsidiary record:", updateError);
      }
    }

    return Object.keys(results).length > 0 ? results : null;
  } catch (error) {
    console.error("Error uploading legal form documents:", error);
    return null;
  }
};

/**
 * Refreshes signed URLs for stored documents
 *
 * @param filePath The path to the file in storage
 * @returns A new signed URL valid for 1 hour, or null on error
 */
export const refreshSignedUrl = async (
  filePath: string,
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from("givve_documents")
      .createSignedUrl(filePath, 3600);

    if (error) {
      throw error;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error("Error refreshing signed URL:", error);
    return null;
  }
};

/**
 * Uploads a design file or logo for card customization
 *
 * @param file The logo or design file
 * @param subsidiaryId The ID of the subsidiary
 * @param isLogo Whether this is a logo file (true) or design file (false)
 * @returns Document metadata if successful, null otherwise
 */
export const uploadCardCustomizationFile = async (
  file: CustomFile,
  subsidiaryId: string,
  isLogo: boolean = true,
): Promise<DocumentFileMetadata | null> => {
  try {
    const category = isLogo
      ? GivveDocumentCategory.LOGOS
      : GivveDocumentCategory.DESIGN_FILES;

    const type = isLogo ? "logo" : "design";

    const uploadResult = await uploadGivveDocument(
      file,
      subsidiaryId,
      category,
      type,
    );

    if (uploadResult) {
      // Update the subsidiary record with the file path
      const updateField = isLogo
        ? { givve_logo_file_path: uploadResult.filePath }
        : { givve_design_file_path: uploadResult.filePath };

      const { error: updateError } = await supabase
        .from("subsidiaries")
        .update(updateField)
        .eq("id", subsidiaryId);

      if (updateError) {
        console.error(
          `Error updating subsidiary ${isLogo ? "logo" : "design"} file path:`,
          updateError,
        );
      }
    }

    return uploadResult;
  } catch (error) {
    console.error(`Error uploading ${isLogo ? "logo" : "design"} file:`, error);
    return null;
  }
};

/**
 * Updates the onboarding progress form data with file metadata
 *
 * @param currentFormData The current form data
 * @param fileMetadata The metadata for uploaded files
 * @param documentKey The key in the form data to update
 * @returns Updated form data with file metadata
 */
export const updateFormDataWithFileMetadata = (
  currentFormData: any,
  fileMetadata: DocumentFileMetadata | DocumentFileMetadata[] | null,
  documentKey: string,
): any => {
  if (!fileMetadata) return currentFormData;

  // Create a copy of the current form data
  const updatedFormData = { ...currentFormData };

  // Ensure documents object exists
  if (!updatedFormData.documents) {
    updatedFormData.documents = {};
  }

  // Update with file metadata
  updatedFormData.documents[documentKey] = fileMetadata;

  return updatedFormData;
};
