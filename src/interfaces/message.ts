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
  tags?: {userName: string; userId: number}[];
  attachments?: {filePath?: string | null; fileName: string}[];
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
