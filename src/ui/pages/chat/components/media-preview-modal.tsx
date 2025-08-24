import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, XIcon } from "lucide-react";
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
      setCurrentIndex((prev) => (prev === 0 ? attachments.length - 1 : prev - 1));
    }
  };

  const goToNext = () => {
    if (canNavigate) {
      setCurrentIndex((prev) => (prev === attachments.length - 1 ? 0 : prev + 1));
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
          <div className="bg-dark3 rounded-lg p-8 text-center">
            <div className="text-light text-lg mb-4">
              {currentAttachment.fileName}
            </div>
            <div className="text-gray text-sm mb-4">
              {currentAttachment.size || "Unknown size"}
            </div>
            <Button
              onClick={handleDownload}
              disabled={isFileLoading(currentAttachment.fileId || "")}
              className="bg-green hover:bg-green/90"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              {isFileLoading(currentAttachment.fileId || "") ? "Downloading..." : "Download"}
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
        className="absolute top-4 right-4 z-10 bg-dark/50 hover:bg-dark text-white"
      >
        <XIcon className="w-6 h-6" />
      </Button>

      {/* Download button */}
      {currentAttachment?.fileId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={isFileLoading(currentAttachment.fileId)}
          className="absolute top-4 right-16 z-10 bg-dark/50 hover:bg-dark text-white"
        >
          <DownloadIcon className="w-5 h-5" />
        </Button>
      )}

      {/* Previous button */}
      {canNavigate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-dark/50 hover:bg-dark text-white"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
      )}

      {/* Next button */}
      {canNavigate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-dark/50 hover:bg-dark text-white"
        >
          <ChevronRightIcon className="w-6 h-6" />
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
