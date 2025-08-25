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

  const getMessageTextColor = (message: any) => {
    if (message?.isDeleteRequest) return "text-danger/30";
    if (message?.isApprovalNeeded) {
      if (message?.isApproved) return "text-green2"; 
      if (message?.isRejected) return "text-danger"; 
      return "text-yellow-400";
    }
    return "text-white";
  };

  // Message action handlers
  const handleApprove = (messageId: string) => {
    console.log("Approve message:", messageId);
    // TODO: Implement approve logic
  };

  const handleReject = (messageId: string) => {
    console.log("Reject message:", messageId);
    // TODO: Implement reject logic
  };

  const handleSendForApproval = (messageId: string) => {
    console.log("Send for approval:", messageId);
    // TODO: Implement send for approval logic
  };

  const handleEdit = (messageId: string) => {
    console.log("Edit message:", messageId);
    // TODO: Implement edit logic
  };

  const handleDelete = (messageId: string) => {
    console.log("Delete message:", messageId);
    // TODO: Implement delete logic
  };

  const handleDeleteRequest = (messageId: string) => {
    console.log("Delete request:", messageId);
    // TODO: Implement delete request logic
  };

  const handleCancelDeleteRequest = (messageId: string) => {
    console.log("Cancel delete request:", messageId);
    // TODO: Implement cancel delete request logic
  };

  const handleInfo = (messageId: string) => {
    console.log("Show message info:", messageId);
    // TODO: Implement info logic
  };

  const handleCopy = (messageId: string) => {
    console.log("Copy message:", messageId);
    // TODO: Implement copy logic
    navigator.clipboard.writeText(text);
  };

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
                <div className={`text-sm leading-5 break-words ${getMessageTextColor({ 
                  isApprovalNeeded: false,
                  isApproved: false,      
                  isRejected: false,      
                  isDeleteRequest: false  
                })}`}>
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
              message={{
                id: id,
                isApprovalNeeded: false, // TODO: Add actual message approval status
                isApproved: false,       // TODO: Add actual message approval status
                isRejected: false,       // TODO: Add actual message rejection status
                isDeleteRequest: false,  // TODO: Add actual delete request status
                type: isGroup ? "group" : "user",
                timestamp: timestamp,
                permissions: {
                  canApprove: !isOwn && isGroup, // TODO: Add actual permission check
                  canEdit: isOwn,                // TODO: Add actual permission check
                  canDelete: isOwn,              // TODO: Add actual permission check
                }
              }}
              onApprove={handleApprove}
              onReject={handleReject}
              onSendForApproval={handleSendForApproval}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteRequest={handleDeleteRequest}
              onCancelDeleteRequest={handleCancelDeleteRequest}
              onInfo={handleInfo}
              onCopy={handleCopy}
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
