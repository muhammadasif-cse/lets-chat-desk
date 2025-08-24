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
          method: "GET", // Changed from POST to GET
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFileName = fileName;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch) {
          downloadFileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      const blob = await response.blob();
      
      // Fallback filename if none provided
      if (!downloadFileName) {
        const contentType = response.headers.get('Content-Type') || '';
        const extension = contentType.includes('image') ? '.jpg' :
                         contentType.includes('video') ? '.mp4' :
                         contentType.includes('audio') ? '.mp3' :
                         contentType.includes('pdf') ? '.pdf' : '';
        downloadFileName = `attachment_${fileId}${extension}`;
      }

      saveAs(blob, downloadFileName);
      
      console.log(`Successfully downloaded: ${downloadFileName}`);
    } catch (error: any) {
      const errorMessage = error?.message || "Download failed";
      setError(errorMessage);
      console.error("Download error:", error);
      
      // Show user-friendly error message
      alert(`Download failed: ${errorMessage}`);
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
