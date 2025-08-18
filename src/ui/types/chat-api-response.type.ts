/* eslint-disable @typescript-eslint/no-explicit-any */
/** @format */

export type TRecentChat = {
  id: string;
  name: string;
  photo: string;
  description: string | null;
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
};
