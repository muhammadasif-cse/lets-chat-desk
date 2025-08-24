import React, { useState } from "react";
import { IMessageProps } from "../../../../interfaces/chat";
import { renderMessageStatus } from "../utils/message-status";
import { renderAttachment } from "../utils/render-attachment";
import { renderMessage } from "../utils/render-message";
import { renderReply } from "../utils/render-reply";
import { formatTime } from "../utils/time-formatting";
import { MediaPreviewModal } from "./media-preview-modal";
import MessageOption from "./message-option";
import MessageReaction from "./message-reaction";

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
  attachments = [],
  replyTo,
  onReply,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOpenReaction, setIsOpenReaction] = useState(false);
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const messageAttachments =
    attachments.length > 0 ? attachments : attachment ? [attachment] : [];

  const mediaAttachments = messageAttachments.filter(
    (att) => att && (att.type === "image" || att.type === "video")
  );

  const handleMediaPreview = (index: number) => {
    setSelectedMediaIndex(index);
    setIsMediaPreviewOpen(true);
  };

  return (
    <div
      className={`flex mb-4 group ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
        {isGroup && !isOwn && (
          <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-dark3 flex items-center justify-center mr-2 mt-auto">
            {senderPhoto ? (
              <img
                src={`${import.meta.env.VITE_API_ASSETS_URL}/${
                  isGroup ? "groupimages" : "photos"
                }/${senderPhoto}`}
                alt={senderName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray text-xs font-medium">
                {senderName
                  ?.split(/(?=[A-Z])|\s+/)
                  .filter(Boolean)
                  .map((word) => word[0]?.toUpperCase())
                  .slice(0, 2)
                  .join("")}
              </span>
            )}
          </div>
        )}
        <div
          data-message-id={id}
          data-message-type={isGroup ? "group" : "user"}
          data-message-sender={senderName}
          className="relative max-w-[40vw]"
        >
          <div
            className={`rounded-2xl px-3 py-2 max-w-full relative ${
              isOwn
                ? "bg-teal2 text-light rounded-br-sm rounded-tl-sm"
                : "bg-dark3 text-light rounded-bl-sm rounded-tr-sm"
            } shadow-sm`}
          >
            {isGroup && !isOwn && (
              <div className="text-green text-sm font-medium mb-1">
                {senderName}
              </div>
            )}
            {renderReply({
              replyTo: replyTo
                ? {
                    id: replyTo.messageId,
                    text: replyTo.text,
                    senderName: replyTo.senderName,
                  }
                : undefined,
              isOwn,
              attachments: replyTo?.attachments || [],
            })}

            {/* Render all attachments */}
            {messageAttachments.map((att, index) =>
              att && att.type ? (
                <div key={index}>
                  {renderAttachment({
                    attachment: {
                      type: att.type,
                      url: att.url || att.filePath || "",
                      name: att.fileName,
                      size: att.size,
                      duration: att.duration,
                      fileId: att.fileId,
                    },
                    onPreview:
                      att.type === "image" || att.type === "video"
                        ? () => handleMediaPreview(index)
                        : undefined,
                  })}
                </div>
              ) : null
            )}

            <div className="flex items-end gap-3">
              {text && (
                <div className="text-light text-sm leading-5 break-words">
                  {renderMessage({
                    text,
                    isOwn,
                  })}
                </div>
              )}
              <div className="flex items-center justify-end space-x-1">
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
          <div
            className={`absolute -top-1 ${isOwn ? "-left-10" : "-right-10"} ${
              isOpenReaction
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } transition-opacity duration-200 z-10`}
          >
            <MessageReaction onReactionToggle={setIsOpenReaction} />
          </div>
        </div>
      </div>

      {isMediaPreviewOpen && mediaAttachments.length > 0 && (
        <MediaPreviewModal
          attachments={mediaAttachments.map((att) => ({
            id: att.fileId || "",
            type: att.type as "image" | "video",
            url: att.url || att.filePath || "",
            name: att.fileName || "",
            size: att.size,
            fileId: att.fileId,
            filePath: att.filePath || att.url || "",
            fileName: att.fileName || "",
          }))}
          initialIndex={selectedMediaIndex}
          isOpen={isMediaPreviewOpen}
          onClose={() => setIsMediaPreviewOpen(false)}
        />
      )}
    </div>
  );
};

export default Message;
