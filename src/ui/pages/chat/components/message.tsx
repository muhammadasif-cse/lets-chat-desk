import React, { useState } from "react";
import { IMessageProps } from "../../../../interfaces/chat";
import { useAppSelector } from "../../../../redux/selector";
import { useGetAdminByGroupIdMutation } from "../../../../redux/store/mutations";
import { renderMessageStatus } from "../helpers/message-status";
import { renderAttachment } from "../helpers/render-attachment";
import { renderMessage } from "../helpers/render-message";
import { renderReply } from "../helpers/render-reply";
import { formatTime } from "../utils/time-formatting";
import { MediaPreviewModal } from "./media-preview-modal";
import MessageEdit from "./message-edit";
import MessageInfo from "./message-info";
import MessageOption from "./message-option";
import MessagePermissions from "./message-permissions";
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
  approvalDecision,
  receiveApprovedRequest,
  deleteRequest,
  deleteMessage,
  cancelDeleteRequest,
  setModifyMessage,
  message,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOpenReaction, setIsOpenReaction] = useState(false);
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  
  // New modal states
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<{messageId: string; type: string}>({
    messageId: "",
    type: "",
  });
  const [admins, setAdmins] = useState<any[]>([]);

  // Redux and API
  const { selectedChatId } = useAppSelector((state) => state.chat);
  const [getAdminByGroupId] = useGetAdminByGroupIdMutation();

  //* get group admins
  const handleGetGroupAdmins = async (groupId: string) => {
    try {
      const response = await getAdminByGroupId(groupId).unwrap();
      const { code, result } = response as { code: number; result: any[] };
      if (code === 200 && Array.isArray(result)) {
        setAdmins(result);
        return result;
      } else {
        console.error("Failed to fetch group admins");
      }
    } catch (error: any) {
      console.error("Error fetching group admins:", error?.data?.message || error.message || "Something went wrong");
    }
  };

  //* send for approval
  const handleSendForApprovalWithSpecific = async (data: any) => {
    if (data.type === "group") {
      const admins = await handleGetGroupAdmins(selectedChatId || "");
      if (admins) {
        setIsPermissionsOpen(true);
        setSelectedMessage({ messageId: data.messageId, type: data.type });
      }
    }
  };

  const getMessageTextColor = (message: any) => {
    if (message?.isDeleteRequest) return "text-danger/30 font-bold";
    if (message?.isApprovalNeeded) {
      if (message?.isApproved) return "text-green2 font-bold"; 
      if (message?.isRejected) return "text-danger font-bold"; 
      return "text-warning font-bold";
    }
    return "text-white";
  };

  // Message action handlers
  const handleApprove = (messageId: string) => {
    console.log("Approve message:", messageId);
    if (approvalDecision && message) {
      approvalDecision(messageId, true, message.type || (isGroup ? "group" : "user"));
    }
  };

  const handleReject = (messageId: string) => {
    console.log("Reject message:", messageId);
    if (approvalDecision && message) {
      approvalDecision(messageId, false, message.type || (isGroup ? "group" : "user"));
    }
  };

  const handleSendForApproval = (messageId: string) => {
    if (receiveApprovedRequest && message) {
      if (message.type === "group") {
        handleSendForApprovalWithSpecific({ messageId, type: message.type });
      } else {
        receiveApprovedRequest(messageId, message.type || (isGroup ? "group" : "user"), null);
      }
    }
  };

  const handleEdit = async (messageId: string) => {
    console.log("Edit message:", messageId);
    setIsEditOpen(true);
  };

  const handleDelete = (messageId: string) => {
    console.log("Delete message:", messageId);
    if (deleteMessage && message) {
      deleteMessage(messageId, message.type || (isGroup ? "group" : "user"));
    }
  };

  const handleDeleteRequest = (messageId: string) => {
    console.log("Delete request:", messageId);
    if (deleteRequest && message) {
      deleteRequest(messageId, message.type || (isGroup ? "group" : "user"));
    }
  };

  const handleCancelDeleteRequest = (messageId: string) => {
    console.log("Cancel delete request:", messageId);
    if (cancelDeleteRequest && message) {
      cancelDeleteRequest(messageId, message.type || (isGroup ? "group" : "user"));
    }
  };

  const handleInfo = (messageId: string) => {
    console.log("Show message info:", messageId);
    setSelectedMessage({ messageId, type: message?.type || (isGroup ? "group" : "user") });
    setIsInfoOpen(true);
  };

  const handleCopy = (messageId: string) => {
    console.log("Copy message:", messageId);
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        console.log("Message copied to clipboard");
        // TODO: Show toast notification
      }).catch((error) => {
        console.error("Failed to copy message:", error);
      });
    }
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
                  isApprovalNeeded: message?.isApprovalNeeded || false,
                  isApproved: message?.isApproved || false,
                  isRejected: message?.isRejected || false,
                  isDeleteRequest: message?.isDeleteRequest || false
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
                isApprovalNeeded: message?.isApprovalNeeded || false,
                isApproved: message?.isApproved || false,
                isRejected: message?.isRejected || false,
                isDeleteRequest: message?.isDeleteRequest || false,
                type: message?.type || (isGroup ? "group" : "user"),
                timestamp: timestamp,
                permissions: {
                  canApprove: !isOwn && isGroup || true,
                  canEdit: isOwn,               
                  canDelete: isOwn,             
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

      {/* Message Permissions Modal */}
      <MessagePermissions
        isOpen={isPermissionsOpen}
        onOpenChange={setIsPermissionsOpen}
        data={admins}
        selectedUserId={selectedUserId}
        onPermissionChange={setSelectedUserId}
        receiveApprovedRequest={receiveApprovedRequest || (() => {})}
        selectedMessage={selectedMessage}
      />

      {/* Message Info Modal */}
      <MessageInfo
        isOpen={isInfoOpen}
        onOpenChange={setIsInfoOpen}
        selectedMessage={selectedMessage}
      />

      {/* Message Edit Modal */}
      <MessageEdit
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        editMessage={message}
        setModifyMessage={setModifyMessage || (async () => {})}
        onTyping={(isTyping) => console.log("Typing:", isTyping)}
      />
    </div>
  );
};

export default Message;
