import { DownloadIcon, PauseIcon, PlayIcon } from "lucide-react";
import { useState } from "react";

export const renderAttachment = ({
  attachment,
}: {
  attachment: {
    type: "image" | "video" | "audio" | "document";
    url: string;
    name?: string;
    size?: string;
    duration?: string;
  };
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!attachment) return null;

  switch (attachment.type) {
    case "image":
      return (
        <div className="relative max-w-sm mb-2">
          <img
            src={attachment.url}
            alt="Attachment"
            className="rounded-lg max-h-80 w-full object-cover"
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-dark3 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
            </div>
          )}
        </div>
      );

    case "video":
      return (
        <div className="relative max-w-sm mb-2">
          <video
            src={attachment.url}
            className="rounded-lg max-h-80 w-full object-cover"
            controls
          />
          <div className="absolute top-2 right-2 bg-dark3 text-light px-2 py-1 rounded text-xs">
            {attachment.duration}
          </div>
        </div>
      );

    case "audio":
      return (
        <div className="flex items-center space-x-3 bg-dark3 rounded-lg p-3 mb-2 min-w-[250px]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-green rounded-full flex items-center justify-center text-light"
          >
            {isPlaying ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5 ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex-1 h-1 bg-dark4 rounded">
                <div className="h-1 bg-green rounded w-1/3"></div>
              </div>
            </div>
            <div className="text-gray text-xs">{attachment.duration}</div>
          </div>
        </div>
      );

    case "document":
      return (
        <div className="flex items-center space-x-3 bg-dark3 rounded-lg p-3 mb-2 min-w-[250px]">
          <div className="w-10 h-10 bg-green rounded-lg flex items-center justify-center">
            <DownloadIcon className="w-5 h-5 text-light" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-light text-sm font-medium truncate">
              {attachment.name}
            </div>
            <div className="text-gray text-xs">{attachment.size}</div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
