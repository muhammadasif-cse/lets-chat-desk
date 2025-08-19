export interface IChatUser {
  id: string;
  name: string;
  username?: string;
  photo?: string;
  type: "user" | "group";
  memberCount?: number; // For groups
}

export interface IMessageMention {
  id: string;
  name: string;
  start: number;
  length: number;
}

export interface IMessageReply {
  id: string;
  text: string;
  senderName: string;
}

export interface IMessageAttachment {
  type: "image" | "video" | "audio" | "document";
  url: string;
  name?: string;
  size?: string;
  duration?: string;
}

export interface IChatMessage {
  id: string;
  text?: string;
  timestamp: string;
  isOwn: boolean;
  isGroup?: boolean;
  senderName?: string;
  senderPhoto?: string;
  senderId?: string;
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

export interface ISelectedChat {
  id: string;
  name: string;
  photo?: string;
  type: "user" | "group";
  isOnline?: boolean;
  lastSeen?: string;
  memberCount?: number;
}

export interface IChatContainerProps {
  selectedChat?: {
    id: string | number;
    name: string;
    photo?: string;
    type: "user" | "group";
    isOnline?: boolean;
    lastSeen?: string;
    memberCount?: number;
  };
  messages?: IChatMessage[];
  users?: IChatUser[];
  currentUserId?: string;
  onSendMessage?: (message: {
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
  onBack?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onInfo?: () => void;
}
