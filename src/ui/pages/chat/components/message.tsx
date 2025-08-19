import React from "react";
import { IMessageProps } from "../../../interfaces/message.interface";
import { renderMessageStatus } from "../utils/message-status";
import { renderAttachment } from "../utils/render-attachment";
import { renderMessage } from "../utils/render-message";
import { renderReply } from "../utils/render-reply";
import { formatTime } from "../utils/time-formatting";
import messageOption from "./message-option";

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
  return (
    <div
      className={`flex mb-4 group ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[55%] ${
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
            {isGroup && !isOwn && (
              <div className="text-green text-sm font-medium mb-1">
                {senderName}
              </div>
            )}
            {renderReply({ replyTo, isOwn })}
            {attachment ? renderAttachment({ attachment }) : null}
            {text && (
              <div className="text-light text-sm leading-5 break-words mb-1">
                {renderMessage({ text, mentions, isOwn })}
              </div>
            )}
            <div className="flex items-center justify-end space-x-1 mt-1">
              <span className={`text-xs ${isOwn ? "text-gray2" : "text-gray"}`}>
                {formatTime(timestamp)}
              </span>
              <div className="w-4 h-4 flex items-center justify-center">
                {renderMessageStatus({ isOwn, status })}
              </div>
            </div>
          </div>

          <div
            className={`absolute top-0 ${
              isOwn ? "left-0 -ml-8" : "right-0 -mr-8"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          >
            {messageOption({ isOwn, onReply })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
