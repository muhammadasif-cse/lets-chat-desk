import { DownloadIcon, FileIcon, PlayIcon } from "lucide-react";
import React from "react";
import { useDownloadFile } from "../../../../hooks/useDownloadFile";

export const renderAttachment = ({
  attachment,
  onPreview,
}: {
  attachment: {
    type: "image" | "video" | "audio" | "document";
    url: string;
    name?: string;
    size?: string;
    duration?: string;
    fileId?: string;
  };
  onPreview?: () => void;
}) => {
  const { downloadFile, isFileLoading } = useDownloadFile();

  if (!attachment) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (attachment.fileId && attachment.name) {
      downloadFile(attachment.fileId, attachment.name);
    }
  };

  const handlePreview = () => {
    if (onPreview && (attachment.type === "image" || attachment.type === "video")) {
      onPreview();
    }
  };

  switch (attachment.type) {
    case "image":
      return (
        <div className="relative max-w-sm mb-2 group cursor-pointer" onClick={handlePreview}>
          <img
            src={attachment.url}
            alt="Attachment"
            className="rounded-lg max-h-80 w-full object-cover transition-opacity group-hover:opacity-80"
          />
          {/* Overlay with download button */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={handleDownload}
              disabled={isFileLoading(attachment.fileId || "")}
              className="bg-dark/70 hover:bg-dark text-white p-2 rounded-full mr-2 transition-colors"
            >
              {isFileLoading(attachment.fileId || "") ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <DownloadIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      );

    case "video":
      return (
        <div className="relative max-w-sm mb-2 group cursor-pointer" onClick={handlePreview}>
          {/* Video thumbnail with play icon overlay */}
          <div className="relative">
            <video
              src={attachment.url}
              className="rounded-lg max-h-80 w-full object-cover"
              controls={false}
              preload="metadata"
              style={{ display: 'block' }}
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 rounded-full p-3">
                <PlayIcon className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </div>
          
          {attachment.duration && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              {attachment.duration}
            </div>
          )}
          
          {/* Download button on hover */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={handleDownload}
              disabled={isFileLoading(attachment.fileId || "")}
              className="bg-dark/70 hover:bg-dark text-white p-2 rounded-full mr-2 transition-colors"
            >
              {isFileLoading(attachment.fileId || "") ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <DownloadIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      );

    case "audio":
      return (
        <div className="flex items-center space-x-3 bg-dark3 rounded-lg p-3 mb-2 min-w-[250px] group">
          <div className="w-10 h-10 bg-green rounded-full flex items-center justify-center text-light">
            <PlayIcon className="w-5 h-5 ml-0.5" />
          </div>
          <div className="flex-1">
            <div className="text-light text-sm font-medium truncate">
              {attachment.name}
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex-1 h-1 bg-dark4 rounded">
                <div className="h-1 bg-green rounded w-1/3"></div>
              </div>
            </div>
            {attachment.duration && (
              <div className="text-gray text-xs">{attachment.duration}</div>
            )}
          </div>
          <button
            onClick={handleDownload}
            disabled={isFileLoading(attachment.fileId || "")}
            className="bg-green hover:bg-green/90 text-white p-2 rounded-full transition-colors"
          >
            {isFileLoading(attachment.fileId || "") ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <DownloadIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      );

    case "document":
      return (
        <div className="flex items-center space-x-3 bg-dark3 rounded-lg p-3 mb-2 min-w-[250px] group">
          <div className="w-10 h-10 bg-green rounded-lg flex items-center justify-center">
            <FileIcon className="w-5 h-5 text-light" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-light text-sm font-medium truncate">
              {attachment.name}
            </div>
            {attachment.size && (
              <div className="text-gray text-xs">{attachment.size}</div>
            )}
          </div>
          <button
            onClick={handleDownload}
            disabled={isFileLoading(attachment.fileId || "")}
            className="bg-green hover:bg-green/90 text-white p-2 rounded-full transition-colors"
          >
            {isFileLoading(attachment.fileId || "") ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <DownloadIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      );

    default:
      return null;
  }
};
