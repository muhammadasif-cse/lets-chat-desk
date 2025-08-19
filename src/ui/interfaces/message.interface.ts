import { IChatUser } from "./chat.interface";

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
