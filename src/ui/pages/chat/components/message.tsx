import React, { useState } from "react";
import { IMessageProps } from "../../../../interfaces/chat";
import { renderMessageStatus } from "../utils/message-status";
import { renderAttachment } from "../utils/render-attachment";
import { renderMessage } from "../utils/render-message";
import { renderReply } from "../utils/render-reply";
import { formatTime } from "../utils/time-formatting";
import MessageOption from "./message-option";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div
      className={`flex mb-4 group ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[55%] ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
      >
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
        <div className="relative">
          <div
            className={`rounded-2xl px-3 py-2 max-w-full relative ${
              isOwn ? "bg-teal2 text-light rounded-br-sm rounded-tl-sm" : "bg-dark3 text-light rounded-bl-sm rounded-tr-sm"
            } shadow-sm`}
          >
            {isGroup && !isOwn && (
              <div className="text-green text-sm font-medium mb-1">
                {senderName}
              </div>
            )}
            {renderReply({ 
              replyTo: replyTo ? {
                id: replyTo.messageId,
                text: replyTo.text,
                senderName: replyTo.senderName
              } : undefined, 
              isOwn 
            })}
            {attachment ? renderAttachment({ 
              attachment: {
                type: attachment.type,
                url: attachment.url || attachment.filePath || "",
                name: attachment.fileName,
                size: attachment.size,
                duration: attachment.duration
              }
            }) : null}
            {text && (
              <div className="text-light text-sm leading-5 break-words mb-1">
                {renderMessage({ 
                  text, 
                  mentions: mentions.map(mention => ({
                    start: mention.startIndex,
                    length: mention.endIndex - mention.startIndex,
                    name: mention.name
                  })), 
                  isOwn 
                })}
              </div>
            )}
            <div className="flex items-center justify-end space-x-1 mt-1">
              <span
                className={`text-xs ${
                  isOwn ? "text-gray-300" : "text-gray-400"
                }`}
              >
                {formatTime(timestamp)}
              </span>
              <div className="w-4 h-4 flex items-center justify-center">
                {renderMessageStatus({ isOwn, status })}
              </div>
            </div>
          </div>

          <div
            className={`absolute -top-1 right-0  ${
              isOwn ? "right-0 -mr-0" : "left-0 -ml-0"
            } ${
              isDropdownOpen
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } transition-opacity duration-200 z-10`}
          >
            <MessageOption
              isOwn={isOwn}
              onReply={onReply}
              onDropdownChange={setIsDropdownOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
