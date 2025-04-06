import { supabase } from "@/utils/supabase/client";
import { File as CustomFile } from "@/shared/file";
import { OnboardingFileMetadata } from "../types";

interface FileUploadResult {
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  signedUrl: string;
}

/**
 * Uploads a file to Supabase storage in the givve_documents bucket
 * Returns the file metadata including a signed URL
 */
export const uploadFile = async (
  file: CustomFile,
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
        name: file.name,
        path: filePath,
        type: file.type,
        size: file.size,
        url: data.signedUrl,
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
 * Uploads multiple legal form documents to Supabase storage
 * and returns metadata for all successfully uploaded files
 */
export const uploadLegalFormDocuments = async (
  files: { [key: string]: CustomFile[] },
  subsidiaryId: string,
  legalForm: string,
): Promise<{ [key: string]: OnboardingFileMetadata[] } | null> => {
  if (!subsidiaryId) {
    console.error("Missing subsidiary ID");
    return null;
  }

  try {
    const uploadResults: { [key: string]: OnboardingFileMetadata[] } = {};
    const folderName = `legal_form_documents/${legalForm}`;

    // Upload files for each document type
    for (const documentType in files) {
      const filesForType = files[documentType];
      const uploads: OnboardingFileMetadata[] = [];

      for (const file of filesForType) {
        const uploadResult = await uploadFile(file, subsidiaryId, folderName);
        if (uploadResult) {
          uploads.push(uploadResult);
        }
      }

      if (uploads.length > 0) {
        uploadResults[documentType] = uploads;
      }
    }

    // Update subsidiary record with the legal documents path
    const { error: updateError } = await supabase
      .from("subsidiaries")
      .update({
        givve_legal_documents_bucket_path: `${subsidiaryId}/${folderName}`,
      })
      .eq("id", subsidiaryId);

    if (updateError) {
      console.error(
        "Error updating subsidiary with documents path:",
        updateError,
      );
    }

    return Object.keys(uploadResults).length > 0 ? uploadResults : null;
  } catch (error) {
    console.error("Error uploading legal form documents:", error);
    return null;
  }
};

/**
 * Updates the givve onboarding form data with document metadata
 * and ensures that the documents are properly saved to be used later
 */
export const prepareDocumentsForSaving = (
  documentFormData: any,
  uploadedDocuments: Record<string, FileUploadResult>,
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
      uploadedAt: new Date().toISOString(),
      signedUrl: metadata.signedUrl,
    };
  }

  // Ensure industry is properly saved
  if (documentsData.industry) {
    documentsData.givve_industry_category = documentsData.industry;
  }

  return documentsData;
};
