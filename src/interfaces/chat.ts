import { TUser } from "../ui/types/user.type";
import { IUserInfo } from "./user";

export interface ChatHeaderProps {
  user: IUserInfo;
  gotoSpecificMessage: (gotoDirectMessage: IGotoSpecificMessage) => void;
  handleBackToUserList?: () => void;
}

export interface IGotoSpecificMessage {
  messageId: string;
  senderId?: number;
  receiverId?: number;
  type?: string;
  groupId?: string;
}

export interface IChatProps {
  photo: string;
  name: string;
  message: string;
  date: string;
  unreadMessage?: number;
  active?: boolean;
}

export type GetChatsParams = {
  userId?: number;
  toUserId?: number;
  groupId?: string;
  type?: string;
  userInfo: TUser;
  callCount?: number;
  mode?: "newer" | "older" | "replace";
};
