import {
    ChevronLeftIcon,
    ChevronRightIcon,
    DownloadIcon,
    XIcon,
} from "lucide-react";
import React, { useState } from "react";
import { useDownloadFile } from "../../../../hooks/useDownloadFile";
import { IMessageAttachment } from "../../../../interfaces/chat";
import { Button } from "../../../components/ui/button";

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachments: IMessageAttachment[];
  initialIndex?: number;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  isOpen,
  onClose,
  attachments,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { downloadFile, isFileLoading } = useDownloadFile();

  if (!isOpen || !attachments.length) return null;

  const currentAttachment = attachments[currentIndex];
  const canNavigate = attachments.length > 1;

  const goToPrevious = () => {
    if (canNavigate) {
      setCurrentIndex((prev) =>
        prev === 0 ? attachments.length - 1 : prev - 1
      );
    }
  };

  const goToNext = () => {
    if (canNavigate) {
      setCurrentIndex((prev) =>
        prev === attachments.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleDownload = () => {
    if (currentAttachment?.fileId && currentAttachment?.fileName) {
      downloadFile(currentAttachment.fileId, currentAttachment.fileName);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderMedia = () => {
    if (!currentAttachment) return null;

    switch (currentAttachment.type) {
      case "image":
        return (
          <img
            src={currentAttachment.url}
            alt={currentAttachment.fileName}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: "80vh", maxWidth: "80vw" }}
          />
        );

      case "video":
        return (
          <video
            src={currentAttachment.url}
            controls
            className="max-w-full max-h-full"
            style={{ maxHeight: "80vh", maxWidth: "80vw" }}
          >
            Your browser does not support the video tag.
          </video>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center text-white">
            <div className="bg-dark3 p-6 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 6h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
                />
              </svg>
            </div>
            <div className="text-lg">{currentAttachment.fileName}</div>
            <div className="text-sm text-gray-400">
              {currentAttachment.size || "Unknown size"}
            </div>
            <Button
              onClick={handleDownload}
              disabled={isFileLoading(currentAttachment.fileId || "")}
              className="bg-green hover:bg-green/90 mt-4"
            >
              <DownloadIcon className="w-4 h-4 mr-2 text-white" />
              {isFileLoading(currentAttachment.fileId || "")
                ? "Downloading..."
                : "Download"}
            </Button>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-dark/50 hover:bg-dark"
      >
        <XIcon className="w-6 h-6 text-white" />
      </Button>

      {/* Download button */}
      {currentAttachment?.fileId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={isFileLoading(currentAttachment.fileId)}
          className="absolute top-4 right-16 z-10 bg-dark/50 hover:bg-dark"
        >
          {isFileLoading(currentAttachment.fileId) ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <DownloadIcon className="w-5 h-5 text-white" />
          )}
        </Button>
      )}

      {/* Previous button */}
      {canNavigate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-dark/50 hover:bg-dark"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Next button */}
      {canNavigate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-dark/50 hover:bg-dark"
        >
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Media content */}
      <div className="flex items-center justify-center w-full h-full">
        {renderMedia()}
      </div>

      {/* Image counter */}
      {canNavigate && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-dark/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} of {attachments.length}
        </div>
      )}
    </div>
  );
};
