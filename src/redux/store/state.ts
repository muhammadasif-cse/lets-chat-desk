import { IMessage } from "../../interfaces/message";
import { IRecentChatUsers, IUserInfo, TUser } from "../../interfaces/user";

export type TChatPermissions = {
  id: string;
  isEditGroupSettings: boolean;
  isSendMessages: boolean;
  isAddMembers: boolean;
  isAdmin: boolean;
  hasDeleteRequest: boolean;
};

type TChatState = {
  callCount: number;
  allActiveUsers: TUser[];
  messages: IMessage[];
  recentChatUsers: IRecentChatUsers[];
  selectedUserInfo: IUserInfo;
  permissions?: TChatPermissions[];
  selectedReplyMessage: { messageId: string; type: string; message: string };
  searchQuery: string;
  typingStatus: any;
  totalGroupOnline: number;
  initialCallCount: number;
  hasReachedEndOfOlderMessages: boolean;
  hasReachedEndOfNewerMessages: boolean;
};

const initialState: TChatState = {
  callCount: 0,
  messages: [],
  allActiveUsers: [],
  recentChatUsers: [],
  searchQuery: "",
  selectedReplyMessage: { messageId: "", type: "", message: "" },
  typingStatus: {},
  totalGroupOnline: 0,
  selectedUserInfo: {
    id: 0,
    name: "",
    type: "user",
    description: "",
    lastOnline: "",
    photo: "",
    isOnline: false,
    isSendMessages: false,
  },
  permissions: [],
  initialCallCount: 0,
  hasReachedEndOfOlderMessages: false,
  hasReachedEndOfNewerMessages: false,
};

export default initialState;
