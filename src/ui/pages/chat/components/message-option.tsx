import { CHAT_CONFIG } from "@/constants/app.constants";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  EditIcon,
  InfoIcon,
  ReplyIcon,
  SendIcon,
  Trash2Icon,
  UndoIcon,
  XIcon
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

interface MessageOptionProps {
  isOwn: boolean;
  onReply?: () => void;
  onDropdownChange?: (isOpen: boolean) => void;
  message?: {
    id: string;
    isApprovalNeeded?: boolean;
    isApproved?: boolean;
    isRejected?: boolean;
    isDeleteRequest?: boolean;
    type?: "user" | "group";
    timestamp?: string;
    userId?: number;
    currentUserId?: number;
    permissions?: {
      canApprove?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
    };
  };
  onApprove?: (messageId: string) => void;
  onReject?: (messageId: string) => void;
  onSendForApproval?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onDeleteRequest?: (messageId: string) => void;
  onCancelDeleteRequest?: (messageId: string) => void;
  onInfo?: (messageId: string) => void;
  onCopy?: (messageId: string) => void;
}

export default function MessageOption({
  isOwn,
  onReply,
  onDropdownChange,
  message,
  onApprove,
  onReject,
  onSendForApproval,
  onEdit,
  onDelete,
  onDeleteRequest,
  onCancelDeleteRequest,
  onInfo,
  onCopy,
}: MessageOptionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onDropdownChange?.(open);
  };

  const isWithinTimeLimit = () => {
    if (!message?.timestamp) return true;
    const messageTime = new Date(message.timestamp).getTime();
    const now = Date.now();
    const diffMinutes = (now - messageTime) / (1000 * 60);
    return diffMinutes < CHAT_CONFIG.MAX_MESSAGE_ACTION_TIME;
  };

  const canApproveReject = !isOwn && 
    message?.isApprovalNeeded && 
    !message?.isApproved && 
    !message?.isRejected &&
    message?.permissions?.canApprove;

  const canSendForApproval = isOwn && 
    !message?.isApprovalNeeded && 
    isWithinTimeLimit();

  const canEdit = isOwn && 
    isWithinTimeLimit() && 
    !message?.isApproved && 
    !message?.isRejected &&
    message?.permissions?.canEdit;

  const canDeleteRequest = isOwn && 
    isWithinTimeLimit() && 
    !message?.isApprovalNeeded && 
    !message?.isApproved && 
    !message?.isRejected && 
    !message?.isDeleteRequest;

  const canConfirmDelete = !isOwn && message?.isDeleteRequest;

  const canCancelDelete = isOwn && message?.isDeleteRequest;

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={`h-8 w-8 bg-transparent group-hover:bg-[radial-gradient(circle,_rgba(0,0,0,0.3)_0%,_transparent_80%)]
             group-hover:rounded-tr-xl transition-all duration-500 text-light p-1 -ml-0.5 -mr-2 -mt-1 ${
               isOpen &&
               "bg-[radial-gradient(circle,_rgba(0,0,0,0.3)_0%,_transparent_80%)] rounded-tr-xl"
             }`}
        >
          <ChevronDownIcon className="size-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isOwn ? "end" : "start"}
        className="bg-dark3 border-dark2 text-light shadow-lg z-50 min-w-48"
        sideOffset={8}
      >
        {/* Approval Actions */}
        {canApproveReject && (
          <>
            <DropdownMenuItem
              onClick={() => onApprove?.(message?.id || "")}
              className="cursor-pointer text-green-400"
            >
              <CheckIcon className="size-4 mr-2" />
              <span className="font-medium">Approve</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onReject?.(message?.id || "")}
              className="cursor-pointer hover:bg-dark/30 focus:bg-dark/30"
            >
              <XIcon className="size-4 mr-2" />
              <span className="font-medium text-danger">Reject</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-green h-0.5" />
          </>
        )}

        {/* Send for Approval */}
        {canSendForApproval && (
          <>
            <DropdownMenuItem
              onClick={() => onSendForApproval?.(message?.id || "")}
              className="cursor-pointer hover:bg-dark/30 focus:bg-dark/30"
            >
              <SendIcon className="size-4 mr-2 text-warning" />
              <span className="font-medium text-warning">Send for Approval</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-green h-[1.5px]" />
          </>
        )}

        {/* Standard Actions */}
        {onReply && (
          <DropdownMenuItem
            onClick={onReply}
            className="cursor-pointer hover:bg-dark/30 focus:bg-dark/30"
          >
            <ReplyIcon className="size-4 mr-2" />
            <span className="font-medium text-white">Reply</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem 
          onClick={() => onCopy?.(message?.id || "")}
          className="cursor-pointer hover:bg-dark/30 focus:bg-dark/30"
        >
          <CopyIcon className="size-4 mr-2" />
          <span className="font-medium text-white">Copy</span>
        </DropdownMenuItem>

        {/* Owner Actions */}
        {isOwn && (
          <>
            <DropdownMenuItem
              onClick={() => onInfo?.(message?.id || "")}
              className="cursor-pointer hover:bg-dark/30 focus:bg-dark/30"
            >
              <InfoIcon className="size-4 mr-2" />
              <span className="font-medium text-white">Info</span>
            </DropdownMenuItem>

            {canEdit && (
              <DropdownMenuItem
                onClick={() => onEdit?.(message?.id || "")}
                className="cursor-pointer hover:bg-dark/30 focus:bg-dark/30"
              >
                <EditIcon className="size-4 mr-2" />
                <span className="font-medium text-white">Edit</span>
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* Delete Actions */}
        {(canDeleteRequest || canConfirmDelete || canCancelDelete) && (
          <>
           <DropdownMenuSeparator className="bg-green h-0.5" />
            {canDeleteRequest && (
              <DropdownMenuItem
                onClick={() => onDeleteRequest?.(message?.id || "")}
                className="cursor-pointer hover:bg-dark/30 focus:bg-dark/30"
              >
                <Trash2Icon className="size-4 mr-2 text-danger" />
                <span className="font-medium text-danger">Delete Request</span>
              </DropdownMenuItem>
            )}

            {canConfirmDelete && (
              <DropdownMenuItem
                onClick={() => onDelete?.(message?.id || "")}
                className="cursor-pointer hover:bg-dark/30 focus:bg-dark/30"
              >
                <Trash2Icon className="size-4 mr-2 text-danger" />
                <span className="font-medium text-danger">Delete Confirm</span>
              </DropdownMenuItem>
            )}

            {canCancelDelete && (
              <DropdownMenuItem
                onClick={() => onCancelDeleteRequest?.(message?.id || "")}
                className="cursor-pointer hover:bg-dark/30 focus:bg-dark/30"
              >
                <UndoIcon className="size-4 mr-2 text-warning" />
                <span className="font-medium text-warning">Undo Delete</span>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
