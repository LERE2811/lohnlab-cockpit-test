"use client";

import { useState, useEffect } from "react";
import { getSignedUrl } from "@/utils/file-upload";

/**
 * Hook to get a signed URL for a document path
 * @param filePath The path of the file in the storage bucket
 * @param expirySeconds The number of seconds until the URL expires (default: 3600 = 1 hour)
 * @returns An object containing the signed URL and loading state
 */
export const useDocumentUrl = (
  filePath: string | null | undefined,
  expirySeconds: number = 3600,
) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!filePath) {
        setUrl(null);
        return;
      }

      // If the filePath is already a full URL (starts with http), use it directly
      if (filePath.startsWith("http")) {
        setUrl(filePath);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const signedUrl = await getSignedUrl(filePath, expirySeconds);
        setUrl(signedUrl);
      } catch (err) {
        console.error("Error fetching signed URL:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to get signed URL"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [filePath, expirySeconds]);

  return { url, isLoading, error };
};
