import { supabase } from "@/utils/supabase/client";

export interface FileMetadata {
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  signedUrl: string;
}

export interface OnboardingFileMetadata {
  givve_company_logo?: FileMetadata;
  givve_card_design?: FileMetadata;
  collective_agreement_document?: FileMetadata;
  commercial_register_document?: FileMetadata;
  [key: string]: FileMetadata | undefined;
}

/**
 * Regenerates signed URLs for all files in the metadata object
 * @param fileMetadata The file metadata object
 * @returns Updated file metadata with fresh signed URLs
 */
export const regenerateSignedUrls = async (
  fileMetadata: OnboardingFileMetadata,
): Promise<OnboardingFileMetadata> => {
  if (!fileMetadata) return {};

  const updatedMetadata: OnboardingFileMetadata = { ...fileMetadata };

  // Process each file entry
  for (const [key, metadata] of Object.entries(fileMetadata)) {
    if (metadata && metadata.filePath) {
      try {
        // Generate a new signed URL
        const { data, error } = await supabase.storage
          .from("onboarding_documents")
          .createSignedUrl(metadata.filePath, 3600); // 1 hour expiry

        if (error) {
          console.error(`Error regenerating signed URL for ${key}:`, error);
          continue;
        }

        // Update the signed URL in the metadata
        updatedMetadata[key] = {
          ...metadata,
          signedUrl: data.signedUrl,
        };
      } catch (error) {
        console.error(`Error processing ${key}:`, error);
      }
    }
  }

  return updatedMetadata;
};

/**
 * Adds or updates a file in the metadata object
 * @param fileMetadata The existing file metadata object
 * @param key The key for the file (e.g., 'givve_company_logo')
 * @param fileData The new file data
 * @returns Updated file metadata
 */
export const updateFileMetadata = (
  fileMetadata: OnboardingFileMetadata | undefined,
  key: string,
  fileData: {
    signedUrl: string;
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  },
): OnboardingFileMetadata => {
  const currentMetadata = fileMetadata || {};

  return {
    ...currentMetadata,
    [key]: {
      fileName: fileData.fileName,
      filePath: fileData.filePath,
      fileType: fileData.fileType,
      fileSize: fileData.fileSize,
      uploadedAt: new Date().toISOString(),
      signedUrl: fileData.signedUrl,
    },
  };
};

/**
 * Removes a file from the metadata object
 * @param fileMetadata The existing file metadata object
 * @param key The key for the file to remove
 * @returns Updated file metadata
 */
export const removeFileMetadata = (
  fileMetadata: OnboardingFileMetadata | undefined,
  key: string,
): OnboardingFileMetadata => {
  if (!fileMetadata) return {};

  const updatedMetadata = { ...fileMetadata };
  delete updatedMetadata[key];

  return updatedMetadata;
};

/**
 * Generates a signed URL for a document path
 * @param filePath The path of the file in the storage bucket
 * @param expirySeconds The number of seconds until the URL expires (default: 3600 = 1 hour)
 * @returns The signed URL or null if there was an error
 */
export const getSignedUrl = async (
  filePath: string | null | undefined,
  expirySeconds: number = 3600,
): Promise<string | null> => {
  if (!filePath) return null;

  try {
    const { data, error } = await supabase.storage
      .from("onboarding_documents")
      .createSignedUrl(filePath, expirySeconds);

    if (error) {
      console.error(`Error generating signed URL for ${filePath}:`, error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error(`Error in getSignedUrl for ${filePath}:`, error);
    return null;
  }
};
