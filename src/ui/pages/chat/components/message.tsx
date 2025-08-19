import {
  Clock,
  Download,
  MoreVertical,
  Pause,
  Play,
  Reply,
} from "lucide-react";
import React, { useState } from "react";
import { Check2Icon, CheckIcon } from "../../../assets/icons/check.icon";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { IMessageProps } from "../../../interfaces/message.interface";
import { formatTime } from "../utils/time-formatting";

const Message: React.FC<IMessageProps> = ({
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
  onReply,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const renderMessageStatus = () => {
    if (!isOwn) return null;

    switch (status) {
      case "sending":
        return <Clock className="text-gray" />;
      case "sent":
        return <CheckIcon className="text-gray " />;
      case "delivered":
        return <Check2Icon className="text-gray" />;
      case "read":
        return <Check2Icon className="text-blue" />;
      default:
        return null;
    }
  };

  const renderTextWithMentions = (text: string) => {
    if (!mentions.length && !hasFormatting(text)) return text;

    // First, handle mentions
    let processedText = text;
    let mentionElements: React.ReactNode[] = [];

    if (mentions.length > 0) {
      let lastIndex = 0;
      mentions.forEach((mention, index) => {
        if (mention.start > lastIndex) {
          mentionElements.push(processedText.slice(lastIndex, mention.start));
        }
        mentionElements.push(
          <span
            key={`mention-${index}`}
            className={`mention-highlight ${
              isOwn ? "text-white" : "text-blue"
            } font-medium`}
          >
            @{mention.name}
          </span>
        );
        lastIndex = mention.start + mention.length;
      });

      if (lastIndex < processedText.length) {
        mentionElements.push(processedText.slice(lastIndex));
      }
    } else {
      mentionElements = [processedText];
    }

    // Then handle WhatsApp-style formatting
    return mentionElements.map((element, index) => {
      if (typeof element === "string") {
        return (
          <span
            key={index}
            dangerouslySetInnerHTML={{ __html: formatWhatsAppText(element) }}
          />
        );
      }
      return element;
    });
  };

  const hasFormatting = (text: string): boolean => {
    return /\*[^*]+\*|_[^_]+_|~[^~]+~|```[^`]+```/.test(text);
  };

  const formatWhatsAppText = (text: string): string => {
    return (
      text
        // Bold: *text*
        .replace(/\*([^*]+)\*/g, '<strong class="font-bold">$1</strong>')
        // Italic: _text_
        .replace(/_([^_]+)_/g, '<em class="italic">$1</em>')
        // Strikethrough: ~text~
        .replace(/~([^~]+)~/g, '<span class="line-through">$1</span>')
        // Code: ```text```
        .replace(
          /```([^`]+)```/g,
          '<code class="bg-dark2 px-1 rounded text-green font-mono text-sm">$1</code>'
        )
    );
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
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
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
              <Download className="w-5 h-5 text-light" />
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

  const renderReply = () => {
    if (!replyTo) return null;

    return (
      <div
        className={`rounded-md border-l-4 border-green pl-3 py-2 mb-2 ${
          isOwn ? "bg-dark2/50" : "bg-dark4/50"
        }`}
      >
        <div className="text-green text-xs font-medium mb-1">
          {replyTo.senderName}
        </div>
        <div className="text-gray2 text-xs truncate leading-tight">
          {replyTo.text}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex mb-4 group ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[70%] ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* avatar for group messages */}
        {isGroup && !isOwn && (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-dark3 flex items-center justify-center mr-2 mt-auto">
            {senderPhoto ? (
              <img
                src={senderPhoto}
                alt={senderName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray text-xs font-medium">
                {senderName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* message bubble */}
        <div className="relative">
          <div
            className={`rounded-lg px-3 py-2 max-w-full relative ${
              isOwn
                ? "bg-green3 text-light rounded-br-sm message-tail-own"
                : "bg-dark3 text-light rounded-bl-sm message-tail-other"
            } shadow-md message-bubble`}
          >
            {/* sender name for group messages */}
            {isGroup && !isOwn && (
              <div className="text-green text-sm font-medium mb-1">
                {senderName}
              </div>
            )}
            {renderReply()}
            {renderAttachment()}

            {/* message text */}
            {text && (
              <div className="text-light text-sm leading-5 break-words mb-1">
                {renderTextWithMentions(text)}
              </div>
            )}

            <div className="flex items-center justify-end space-x-1 mt-1">
              <span className={`text-xs ${isOwn ? "text-gray2" : "text-gray"}`}>
                {formatTime(timestamp)}
              </span>
              <div className="w-4 h-4 flex items-center justify-center">
                {renderMessageStatus()}
              </div>
            </div>
          </div>

          <div
            className={`absolute top-0 ${
              isOwn ? "left-0 -ml-8" : "right-0 -mr-8"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          >
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-dark3/80 hover:bg-dark3 text-gray hover:text-light rounded-full backdrop-blur-sm border border-dark2"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isOwn ? "end" : "start"}
                className="bg-dark3 border-dark2 text-light shadow-lg z-50"
                sideOffset={5}
              >
                {onReply && (
                  <DropdownMenuItem
                    onClick={onReply}
                    className="hover:bg-dark2 focus:bg-dark2 cursor-pointer text-light"
                  >
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="hover:bg-dark2 focus:bg-dark2 cursor-pointer text-light">
                  Copy
                </DropdownMenuItem>
                {isOwn && (
                  <DropdownMenuItem className="hover:bg-dark2 focus:bg-dark2 cursor-pointer text-danger">
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
