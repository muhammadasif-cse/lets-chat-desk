import { useAppSelector } from "@/redux/selector";
import { saveAs } from "file-saver";
import { useState } from "react";

interface UseDownloadFileReturn {
  downloadFile: (fileId: string, fileName?: string) => Promise<void>;
  isLoading: boolean;
  loadingFiles: Set<string>;
  isFileLoading: (fileId: string) => boolean;
  error: string | null;
}

export const useDownloadFile = (): UseDownloadFileReturn => {
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const {token} = useAppSelector((state) => state.auth);

  const downloadFile = async (fileId: string, fileName?: string) => {
    if (!fileId) {
      const errorMessage = "File ID is required";
      setError(errorMessage);
      console.error(errorMessage);
      return;
    }

    setLoadingFiles((prev) => new Set(prev).add(fileId));
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/chatservice/chats/downloadAttachment?attachmentId=${fileId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      saveAs(blob, fileName || `downloaded_file_${fileId}`);
    } catch (error: any) {
      const errorMessage = error?.message || "Download failed";
      setError(errorMessage);
      console.error("Download error:", error);
    } finally {
      setLoadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const isFileLoading = (fileId: string): boolean => {
    return loadingFiles.has(fileId);
  };

  return {
    downloadFile,
    isLoading: loadingFiles.size > 0,
    loadingFiles,
    isFileLoading,
    error,
  };
};
