import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import initialState, { TChatPermissions } from "./state";
import { IRecentChatUsers, IUserInfo, TUser } from "../../interfaces/user";
import { IMessage } from "../../interfaces/message";
import { RootState } from "../store";

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCallCount: (state, action: PayloadAction<number | undefined>) => {
      if (action.payload === undefined) {
        state.callCount += 1;
      } else {
        state.callCount = action.payload;
      }
    },
    setInitialCallCount: (state, action: PayloadAction<number | undefined>) => {
      if (action.payload === undefined) {
        state.initialCallCount += 1;
      } else {
        state.initialCallCount = action.payload;
      }
    },
    setSelectedReplyMessage: (
      state,
      action: PayloadAction<{
        messageId: string;
        type: string;
        message: string;
      }>
    ) => {
      const { messageId, type, message } = action.payload;
      state.selectedReplyMessage = {
        messageId,
        type,
        message,
      };
    },
    setTotalGroupOnline: (state, action: PayloadAction<number>) => {
      state.totalGroupOnline = action.payload;
    },
    setAllActiveUsers: (state, action: PayloadAction<TUser[]>) => {
      state.allActiveUsers = action.payload;
    },
    setMessages: (state, action: PayloadAction<IMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<IMessage>) => {
      // Prevent duplicate messages
      const existingMessage = state.messages.find(
        (m: any) => m.messageId === action.payload.messageId
      );
      if (existingMessage) {
        console.log(
          "Message already exists, skipping:",
          action.payload.messageId
        );
        return;
      }
      state.messages.push(action.payload);
    },
    setPermission: (state, action: PayloadAction<TChatPermissions[]>) => {
      state.permissions = action.payload;
    },
    addReplyMessage: (
      state,
      action: PayloadAction<{
        message: IMessage;
        parentMessageId: string;
        parentMessageText: string;
      }>
    ) => {
      const { message, parentMessageId, parentMessageText } = action.payload;

      // Prevent duplicate reply messages
      const existingReply = state.messages.find(
        (m: any) =>
          m.messageId === message.messageId ||
          (m.parentMessageId === parentMessageId && m.userId === message.userId)
      );
      if (existingReply) {
        console.log(
          "Reply message already exists, skipping:",
          message.messageId
        );
        return;
      }

      const replyMessage = {
        ...message,
        parentMessageId,
        parentMessageText,
      };
      state.messages.push(replyMessage);
    },
    setRecentChatUsers: (state, action: PayloadAction<IRecentChatUsers[]>) => {
      state.recentChatUsers = action.payload;
    },
    setSelectedUserInfoById: (
      state,
      action: PayloadAction<string | number>
    ) => {
      const userId = String(action.payload);
      const user = state.allActiveUsers?.find(
        (u: any) => String((u as any).userId ?? (u as any).id) === userId
      );
      if (user) {
        state.selectedUserInfo = {
          id: (user as any).id ?? (user as any).userId,
          name: (user as any).name,
          description: (user as any).description ?? null,
          photo: (user as any).photo ?? null,
          isOnline: (user as any).isOnline,
          lastOnline: (user as any).lastOnline ?? null,
          type: (user as any).type ?? "user",
        };
      }
    },
    updateMessageAttachments: (
      state,
      action: PayloadAction<{
        messageId: string;
        attachments: { filePath: string; fileName: string }[];
      }>
    ) => {
      const idx = state.messages.findIndex(
        (m: any) => m.messageId === action.payload.messageId
      );
      if (idx !== -1) {
        state.messages[idx].attachments = action.payload.attachments;
      }
    },
    updateRecentChatUsers: (
      state,
      { payload }: PayloadAction<IRecentChatUsers>
    ) => {
      const idx = state.recentChatUsers.findIndex(
        (u: any) =>
          u.id?.toString() === payload.id?.toString() && u.type === payload.type
      );

      if (idx !== -1) {
        const existingUser = state.recentChatUsers[idx];
        const keys: (keyof IRecentChatUsers)[] = [
          "name",
          "photo",
          "lastMessage",
          "lastMessageDate",
          "unreadCount",
          "isAddMembers",
          "isAdmin",
          "isEditGroupSettings",
          "isSendMessages",
          "hasDeleteRequest",
          "isApprovalNeeded",
          "message",
          "attachments",
        ];
        keys.forEach((key) => {
          if (payload[key] !== undefined) {
            (existingUser as any)[key] = payload[key];
          }
        });

        // Only reorder if there's an unread count increase
        if (payload.unreadCount && payload.unreadCount > 0) {
          state.recentChatUsers.splice(idx, 1);
          state.recentChatUsers.unshift(existingUser);
        }
      } else {
        // Add new user if not found
        state.recentChatUsers.unshift(payload);
      }
    },
    removeRecentChatUser: (
      state,
      action: PayloadAction<IRecentChatUsers | { id: string; type: string }>
    ) => {
      const userToRemove = action.payload;
      state.recentChatUsers = state.recentChatUsers.filter(
        (user: any) =>
          user.id?.toString() !== userToRemove.id?.toString() ||
          user.type !== userToRemove.type
      );
    },
    addMessageAndReorder: (
      state,
      action: PayloadAction<{ message: IMessage; recentUser: IRecentChatUsers }>
    ) => {
      const { message, recentUser } = action.payload;

      // Prevent duplicate messages
      const existingMessage = state.messages.find(
        (m: any) => m.messageId === message.messageId
      );
      if (existingMessage) {
        console.log("Message already exists, skipping:", message.messageId);
        return;
      }

      state.messages.push(message);

      // Update recent users
      const index = state.recentChatUsers.findIndex(
        (u: any) =>
          u.id?.toString() === recentUser.id?.toString() &&
          u.type === recentUser.type
      );
      if (index !== -1) {
        state.recentChatUsers.splice(index, 1);
      }
      state.recentChatUsers.unshift(recentUser);
    },
    setSelectedUserInfo: (state, action: PayloadAction<IUserInfo>) => {
      state.selectedUserInfo = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    reorderRecentChats: (state, action: PayloadAction<IRecentChatUsers>) => {
      const userChat = action.payload;
      state.recentChatUsers = state.recentChatUsers.filter(
        (chat: any) => chat.userId !== userChat.userId
      );
      state.recentChatUsers.unshift(userChat);
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageId: string;
        status: "delivered" | "seen" | "sent" | "failed" | "sending" | "queued";
      }>
    ) => {
      const { messageId, status } = action.payload;
      const message = state.messages.find(
        (m: any) => m.messageId === messageId
      );
      if (message) {
        message.status = status;
      }
    },
    updateMessageApproval: (
      state,
      action: PayloadAction<{
        messageId: string;
        isApproved?: boolean;
        isRejected?: boolean;
        isApprovalNeeded?: boolean;
        isDeleteRequest?: boolean;
      }>
    ) => {
      const {
        messageId,
        isApproved,
        isRejected,
        isApprovalNeeded,
        isDeleteRequest,
      } = action.payload;
      const message = state.messages.find(
        (m: any) => m.messageId === messageId
      );

      if (message) {
        if (typeof isApproved === "boolean") {
          message.isApproved = isApproved;
        }
        if (typeof isRejected === "boolean") {
          message.isRejected = isRejected;
        }
        if (typeof isApprovalNeeded === "boolean") {
          message.isApprovalNeeded = isApprovalNeeded;
        }
        if (typeof isDeleteRequest === "boolean") {
          message.isDeleteRequest = isDeleteRequest;
        }
      } else {
        console.warn("Message not found for approval update:", messageId);
      }
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      state.messages = state.messages.filter(
        (m: any) => m.messageId !== messageId
      );
    },
    updateMessage: (
      state,
      action: PayloadAction<{ messageId: string; newMessage: string }>
    ) => {
      const { messageId, newMessage } = action.payload;
      const message = state.messages.find(
        (m: any) => m.messageId === messageId
      );
      if (message) {
        message.message = newMessage;
      }
    },
    updateMessageReactions: (
      state,
      action: PayloadAction<{ messageId: string; reactions: any[] }>
    ) => {
      const { messageId, reactions } = action.payload;
      const message = state.messages.find(
        (m: any) => m.messageId === messageId
      );
      if (message) {
        message.reactions = reactions;
      }
    },
    updateLastMessage: (
      state,
      action: PayloadAction<{ messageId: string; newMessage: string }>
    ) => {
      const { messageId, newMessage } = action.payload;
      const message = state.recentChatUsers.find(
        (m: any) => m.lastMessageId === messageId
      );
      if (message) {
        message.lastMessage = newMessage;
      }
    },
    appendMessages: (state, action: PayloadAction<IMessage[]>) => {
      state.messages = [...state.messages, ...action.payload];
    },
    setTypingStatus: (
      state,
      action: PayloadAction<{
        senderId: number;
        receiverId: number;
        isTyping: boolean;
        username?: string;
        groupId?: string;
        type?: "user" | "group";
        key?: string;
      }>
    ) => {
      state.typingStatus = action.payload;
    },
    setHasReachedEndOfOlderMessages: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.hasReachedEndOfOlderMessages = action.payload;
    },
    setHasReachedEndOfNewerMessages: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.hasReachedEndOfNewerMessages = action.payload;
    },
    resetEndOfDataFlags: (state) => {
      state.hasReachedEndOfOlderMessages = false;
      state.hasReachedEndOfNewerMessages = false;
    },
  },
});

export const {
  setInitialCallCount,
  setMessages,
  addMessage,
  addReplyMessage,
  appendMessages,
  setRecentChatUsers,
  addMessageAndReorder,
  setSelectedUserInfo,
  setSelectedUserInfoById,
  setSearchQuery,
  updateMessageStatus,
  setTypingStatus,
  updateRecentChatUsers,
  setAllActiveUsers,
  updateMessageApproval,
  removeMessage,
  updateMessageAttachments,
  updateMessage,
  updateMessageReactions,
  updateLastMessage,
  setTotalGroupOnline,
  setCallCount,
  removeRecentChatUser,
  setHasReachedEndOfOlderMessages,
  setHasReachedEndOfNewerMessages,
  resetEndOfDataFlags,
  setSelectedReplyMessage,
  setPermission,
} = chatSlice.actions;

export default chatSlice.reducer;

export const chatSelector = (state: RootState) => state.chat;
