import React, { useState } from "react";
import { Check, CheckCheck, Clock, Download, Play, Pause } from "lucide-react";

interface MessageProps {
  id: string;
  text?: string;
  timestamp: string;
  isOwn: boolean;
  isGroup?: boolean;
  senderName?: string;
  senderPhoto?: string;
  status?: "sending" | "sent" | "delivered" | "read";
  attachment?: {
    type: "image" | "video" | "audio" | "document";
    url: string;
    name?: string;
    size?: string;
    duration?: string;
  };
  mentions?: Array<{
    id: string;
    name: string;
    start: number;
    length: number;
  }>;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
}

const Message: React.FC<MessageProps> = ({
  id,
  text,
  timestamp,
  isOwn,
  isGroup,
  senderName,
  senderPhoto,
  status = "sent",
  attachment,
  mentions = [],
  replyTo,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessageStatus = () => {
    if (!isOwn) return null;

    switch (status) {
      case "sending":
        return <Clock className="w-4 h-4 text-[#8696A0]" />;
      case "sent":
        return <Check className="w-4 h-4 text-[#8696A0]" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-[#8696A0]" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-[#53BDEB]" />;
      default:
        return null;
    }
  };

  const renderTextWithMentions = (text: string) => {
    if (!mentions.length) return text;

    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    mentions.forEach((mention, index) => {
      // Add text before mention
      if (mention.start > lastIndex) {
        elements.push(text.slice(lastIndex, mention.start));
      }

      // Add mention
      elements.push(
        <span
          key={`mention-${index}`}
          className="bg-[#053340] text-[#53BDEB] px-1 rounded"
        >
          @{mention.name}
        </span>
      );

      lastIndex = mention.start + mention.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
  };

  const renderAttachment = () => {
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
              <div className="absolute inset-0 bg-[#202C33] rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A884]"></div>
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
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {attachment.duration}
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="flex items-center space-x-3 bg-[#202C33] rounded-lg p-3 mb-2 min-w-[250px]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 bg-[#00A884] rounded-full flex items-center justify-center text-white"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex-1 h-1 bg-[#3B4A54] rounded">
                  <div className="h-1 bg-[#00A884] rounded w-1/3"></div>
                </div>
              </div>
              <div className="text-[#8696A0] text-xs">
                {attachment.duration}
              </div>
            </div>
          </div>
        );

      case "document":
        return (
          <div className="flex items-center space-x-3 bg-[#202C33] rounded-lg p-3 mb-2 min-w-[250px]">
            <div className="w-10 h-10 bg-[#00A884] rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#E9EDEF] text-sm font-medium truncate">
                {attachment.name}
              </div>
              <div className="text-[#8696A0] text-xs">{attachment.size}</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderReply = () => {
    if (!replyTo) return null;

    return (
      <div className="bg-[#202C33] border-l-4 border-[#00A884] pl-3 py-2 mb-2 rounded">
        <div className="text-[#00A884] text-sm font-medium mb-1">
          {replyTo.senderName}
        </div>
        <div className="text-[#8696A0] text-sm truncate">{replyTo.text}</div>
      </div>
    );
  };

  return (
    <div className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[70%] ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar for group messages */}
        {isGroup && !isOwn && (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#374151] flex items-center justify-center mr-2 mt-auto">
            {senderPhoto ? (
              <img
                src={senderPhoto}
                alt={senderName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[#8696A0] text-xs font-medium">
                {senderName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-lg px-3 py-2 max-w-full ${
            isOwn
              ? "bg-[#005C4B] text-[#E9EDEF]"
              : "bg-[#202C33] text-[#E9EDEF]"
          }`}
        >
          {/* Sender name for group messages */}
          {isGroup && !isOwn && (
            <div className="text-[#00A884] text-sm font-medium mb-1">
              {senderName}
            </div>
          )}

          {/* Reply */}
          {renderReply()}

          {/* Attachment */}
          {renderAttachment()}

          {/* Message text */}
          {text && (
            <div className="text-[#E9EDEF] text-sm leading-5 break-words">
              {renderTextWithMentions(text)}
            </div>
          )}

          {/* Timestamp and status */}
          <div className="flex items-center justify-end space-x-1 mt-1">
            <span className="text-[#8696A0] text-xs">
              {formatTime(timestamp)}
            </span>
            {renderMessageStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
