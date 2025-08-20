import { IRecentUsers } from "../../interfaces/user";

export type TChatPermissions = {
  id: string;
  isEditGroupSettings: boolean;
  isSendMessages: boolean;
  isAddMembers: boolean;
  isAdmin: boolean;
  hasDeleteRequest: boolean;
};

export type TChatState = {
  recentUsers: IRecentUsers[];
  permissions: TChatPermissions[];
  searchQuery: string;
};
