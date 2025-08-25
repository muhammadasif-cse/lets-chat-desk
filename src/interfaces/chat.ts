/** @format */

export interface IMessage {
  messageId: string;
  parentMessageId: string | null;
  parentMessageText: string | null;
  date: string;
  message: string;
  senderName: string;
  toUserId: number;
  userId: number;
  status: "sent" | "delivered" | "seen" | "failed" | "sending" | "queued";
  type: "user" | "group";
  isApprovalNeeded: boolean;
  isApproved?: boolean;
  isDeleteRequest?: boolean;
  deleteRequestedAt?: string | null;
  isRejected?: boolean;
  isNotification?: boolean;
  eligibleUsers?: number[] | null;
  attachments: IMessageAttachment[];
}

export interface IMessageAttachment {
  fileId?: string; // From API response
  type?: "image" | "video" | "audio" | "document"; // Computed from fileName
  filePath: string | null;
  fileName: string;
  url?: string; // Computed from filePath
  size?: string;
  duration?: string;
}

export interface IMessageReply {
  messageId: string;
  text: string;
  senderName: string;
  attachments?: IMessageAttachment[];
}

export interface IMessageMention {
  id: string;
  name: string;
  type: "user" | "group";
  startIndex: number;
  endIndex: number;
}

export interface IChatItem {
  id: string;
  name: string;
  photo: string;
  description: string;
  memberCount?: number | undefined;
  type: "user" | "group";
  lastMessage: string;
  lastMessageId: string;
  lastMessageDate: string;
  unreadCount: number;
  isAdmin: boolean;
  isEditGroupSettings: boolean;
  isSendMessages: boolean;
  isAddMembers: boolean;
  hasDeleteRequest: boolean;
}

export interface ISelectedChat {
  id: string;
  name: string;
  photo?: string;
  description?: string;
  lastMessage: string;
  lastMessageId: string;
  lastMessageDate: string;
  type: "user" | "group";
  isOnline?: boolean;
  lastSeen?: string;
  memberCount?: number;
  totalOnline?: number;
  unreadCount?: number;
  isAdmin?: boolean;
  isEditGroupSettings?: boolean;
  isSendMessages?: boolean;
  isAddMembers?: boolean;
  hasDeleteRequest?: boolean;
  eligibleUsers?: number[] | null;
  parentMessageId?: string | null;
  parentMessageText?: string | null;
  isApprovalNeeded?: boolean;
}

export interface IChatUser {
  id: string;
  name: string;
  username?: string;
  photo?: string;
  type: "user" | "group";
  memberCount?: number;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ISendMessageData {
  text: string;
  replyTo?: IMessageReply;
  attachments?: File[]; // Support File objects for upload
  isApprovalNeeded?: boolean;
}

export interface IGetChatsRequest {
  groupId?: string | null;
  toUserId?: number | null;
  userId?: number | null;
  type: "user" | "group";
  callCount: number;
}

export interface IChatApiResponse {
  code: number;
  status: string;
  message: string;
  result: {
    isOnline: boolean;
    totalOnline: number;
    type: "user" | "group";
    count: number;
    messages: IMessage[];
  };
}

export interface IChatListApiResponse {
  code: number;
  status: string;
  message: string;
  result: IChatItem[];
}

export interface IChatContainerProps {
  selectedChat?: ISelectedChat;
  messages?: IMessage[];
  users?: IChatUser[];
  currentUserId?: string;
  onSendMessage?: (message: ISendMessageData) => void;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onInfo?: () => void;
  onLoadPreviousMessages?: (callCount: number) => Promise<boolean>;
  onLoadNextMessages?: (callCount: number) => Promise<boolean>;
  currentCallCount?: number;
  hasMorePrevious?: boolean;
  hasMoreNext?: boolean;
  loadedCallCounts?: number[];
}

export interface IHeaderProps {
  selectedChat?: ISelectedChat;
  onBack?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onInfo?: () => void;
}

export interface IMessageInputProps {
  placeholder?: string;
  onSendMessage: (messageData: ISendMessageData) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  replyTo?: IMessageReply;
  onCancelReply?: () => void;
  users?: Array<{
    id: string;
    name: string;
    photo?: string;
    type?: "user" | "group";
  }>;
  isGroup?: boolean;
}

export interface IMessageProps {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  isGroup: boolean;
  senderName: string;
  senderPhoto?: string;
  status: "sent" | "delivered" | "seen" | "failed" | "sending" | "queued";
  attachment?: IMessageAttachment; // First attachment for backward compatibility
  attachments?: IMessageAttachment[]; // All attachments
  replyTo?: IMessageReply;
  onReply?: () => void;
}
