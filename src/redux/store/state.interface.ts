import { IChatItem, IMessage } from "../../interfaces/chat";

export type TChatPermissions = {
  id: string;
  isEditGroupSettings: boolean;
  isSendMessages: boolean;
  isAddMembers: boolean;
  isAdmin: boolean;
  hasDeleteRequest: boolean;
};

export type TChatState = {
  recentUsers: IChatItem[];
  permissions: TChatPermissions[];
  searchQuery: string;
  chats: IMessage[];
  currentCallCount: number;
  loadedCallCounts: number[];
  hasMorePrevious: boolean;
  hasMoreNext: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  selectedChatId: string | null;
  typingStatus: {
    senderId: number;
    receiverId: number;
    isTyping: boolean;
    username?: string;
    groupId?: string;
    type?: "user" | "group";
    key?: string;
  } | null;
};
