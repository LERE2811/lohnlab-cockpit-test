import { FileMetadata } from "@/utils/file-upload";
import { supabase } from "@/utils/supabase/client";
import { OnboardingFileMetadata } from "../types";

/**
 * Uploads a file to Supabase storage in the givve_documents bucket
 * Returns the file metadata including a signed URL
 */
export const uploadFile = async (
  file: File,
  subsidiaryId: string,
  folder: string,
): Promise<OnboardingFileMetadata | null> => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${subsidiaryId}/${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("givve_documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Generate a signed URL for the uploaded file (valid for 1 hour)
    const { data } = await supabase.storage
      .from("givve_documents")
      .createSignedUrl(filePath, 3600);

    if (data) {
      return {
        fileName: file.name,
        filePath: filePath,
        fileType: file.type,
        fileSize: file.size,
        signedUrl: data.signedUrl,
        uploadedAt: new Date().toISOString(),
      };
    } else {
      throw new Error("Could not generate signed URL");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

/**
 * Handles the upload of documents for a legal form
 */
export const uploadLegalFormDocuments = async (
  documents: { [key: string]: File | undefined },
  company_id: string,
  folder: string,
): Promise<Record<string, OnboardingFileMetadata>> => {
  const entries = Object.entries(documents).filter(
    ([, file]) => file !== undefined,
  ) as [string, File][];

  // Process all uploads in parallel
  const uploadPromises = entries.map(async ([key, file]) => {
    const fileWithMetadata = await uploadFile(
      file,
      company_id,
      `${folder}/${key}`,
    );

    return [key, fileWithMetadata] as [string, OnboardingFileMetadata];
  });

  const resolvedUploads = await Promise.all(uploadPromises);
  return Object.fromEntries(resolvedUploads);
};

/**
 * Updates the givve onboarding form data with document metadata
 * and ensures that the documents are properly saved to be used later
 */
export const prepareDocumentsForSaving = (
  documentFormData: any,
  uploadedDocuments: Record<string, OnboardingFileMetadata>,
): Record<string, any> => {
  const documentsData = { ...documentFormData };

  // Process each uploaded file
  for (const [key, metadata] of Object.entries(uploadedDocuments)) {
    // Update the document entry with metadata instead of just the file name
    documentsData[key] = {
      fileName: metadata.fileName,
      filePath: metadata.filePath,
      fileType: metadata.fileType,
      fileSize: metadata.fileSize,
      uploadedAt: metadata.uploadedAt || new Date().toISOString(),
      signedUrl: metadata.signedUrl,
    };
  }

  // Ensure industry is properly saved
  if (documentsData.industry) {
    documentsData.givve_industry_category = documentsData.industry;
  }

  return documentsData;
};
