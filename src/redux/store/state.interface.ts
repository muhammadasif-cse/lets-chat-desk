import { IMessage } from "../../interfaces/message";
import { IRecentUser } from "../../interfaces/user";

export type TChatPermissions = {
  id: string;
  isEditGroupSettings: boolean;
  isSendMessages: boolean;
  isAddMembers: boolean;
  isAdmin: boolean;
  hasDeleteRequest: boolean;
};

export type TChatState = {
  recentUsers: IRecentUser[];
  permissions: TChatPermissions[];
  searchQuery: string;
  chats: IMessage[];
};
