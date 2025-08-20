import { IChatUser } from "./chat";

export interface IMessageReactionUser {
  userId: number;
  userName: string;
  name: string;
  photo: string;
}

export interface IMessageReaction {
  reaction: string;
  count: number;
  users: IMessageReactionUser[];
}

export interface IMessage {
  messageId: string;
  message: string;
  tags?: { userName: string; userId: number }[];
  attachments?: { filePath?: string | null; fileName: string }[];
  parentMessageId?: string | null;
  parentMessageText?: string | null;
  isApprovalNeeded: boolean;
  isApproved?: boolean;
  isRejected?: boolean;
  isDeleteRequest?: boolean;
  eligibleUsers?: number[];
  userId?: number;
  toUserId?: number;
  groupId?: string | null;
  senderName?: string | null;
  date: string;
  userName?: string;
  isNotification?: boolean;
  type: "user" | "group";
  status: "sent" | "delivered" | "seen" | "failed" | "sending" | "queued";
  reactions?: IMessageReaction[];
}

export interface IMessageProps {
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
  onReply?: () => void;
}

export interface IMessageInputProps {
  onSendMessage: (message: {
    text: string;
    mentions: Array<{
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
  }) => void;
  onTyping?: (isTyping: boolean) => void;
  users?: IChatUser[];
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  } | null;
  onCancelReply?: () => void;
  placeholder?: string;
  isGroup?: boolean;
}
