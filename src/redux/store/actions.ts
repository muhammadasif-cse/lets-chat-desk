import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IChatItem, IMessage } from "../../interfaces/chat";
import { RootState } from "../store";
import initialState from "./state";
import { TChatPermissions } from "./state.interface";

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setRecentUsers: (state, action: PayloadAction<IChatItem[]>) => {
      state.recentUsers = action.payload;
    },
    setUpdateRecentUsers: (state, action: PayloadAction<IChatItem>) => {
      const index = state.recentUsers.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        // Update existing user
        state.recentUsers[index] = action.payload;
        // Move to top if it's not already at the top
        if (index !== 0) {
          const [updatedUser] = state.recentUsers.splice(index, 1);
          state.recentUsers.unshift(updatedUser);
        }
      } else {
        // Add new user at the top
        state.recentUsers.unshift(action.payload);
      }
    },
    addOrUpdateRecentUser: (state, action: PayloadAction<IChatItem>) => {
      const index = state.recentUsers.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        // Update existing user and move to top
        state.recentUsers[index] = action.payload;
        if (index !== 0) {
          const [updatedUser] = state.recentUsers.splice(index, 1);
          state.recentUsers.unshift(updatedUser);
        }
      } else {
        // Add new user at the top
        state.recentUsers.unshift(action.payload);
      }
    },
    setPermissions: (state, action: PayloadAction<TChatPermissions[]>) => {
      state.permissions = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setChats: (state, action: PayloadAction<IMessage[]>) => {
      state.chats = action.payload;
      state.error = null;
    },
    appendPreviousChats: (state, action: PayloadAction<IMessage[]>) => {
      const newMessages = action.payload.filter(
        (newMsg) =>
          !state.chats.some(
            (existingMsg) => existingMsg.messageId === newMsg.messageId
          )
      );
      state.chats = [...newMessages, ...state.chats];
    },
    appendNextChats: (state, action: PayloadAction<IMessage[]>) => {
      const newMessages = action.payload.filter(
        (newMsg) =>
          !state.chats.some(
            (existingMsg) => existingMsg.messageId === newMsg.messageId
          )
      );
      state.chats = [...state.chats, ...newMessages];
    },
    setCurrentCallCount: (state, action: PayloadAction<number>) => {
      state.currentCallCount = action.payload;
    },
    addLoadedCallCount: (state, action: PayloadAction<number>) => {
      if (!state.loadedCallCounts.includes(action.payload)) {
        state.loadedCallCounts.push(action.payload);
      }
    },
    setHasMorePrevious: (state, action: PayloadAction<boolean>) => {
      state.hasMorePrevious = action.payload;
    },
    setHasMoreNext: (state, action: PayloadAction<boolean>) => {
      state.hasMoreNext = action.payload;
    },
    setIsLoadingMessages: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMessages = action.payload;
    },
    setSelectedChatId: (state, action: PayloadAction<string | null>) => {
      state.selectedChatId = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetChatState: (state) => {
      state.chats = [];
      state.currentCallCount = 0;
      state.loadedCallCounts = [];
      state.hasMorePrevious = false;
      state.hasMoreNext = false;
      state.isLoadingMessages = false;
      state.error = null;
    },
    addOptimisticMessage: (state, action: PayloadAction<IMessage>) => {
      state.chats.push(action.payload);
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ messageId: string; status: IMessage["status"] }>
    ) => {
      const message = state.chats.find(
        (msg) => msg.messageId === action.payload.messageId
      );
      if (message) {
        message.status = action.payload.status;
      }
    },
    updateMessageAttachments: (
      state,
      action: PayloadAction<{
        messageId: string;
        attachments: IMessage["attachments"];
      }>
    ) => {
      const message = state.chats.find(
        (msg) => msg.messageId === action.payload.messageId
      );
      if (message) {
        message.attachments = action.payload.attachments;
      }
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
      if (!action.payload.isTyping) {
        state.typingStatus = null;
      } else {
        state.typingStatus = action.payload;
      }
    },
  },
});

export const {
  setRecentUsers,
  setUpdateRecentUsers,
  addOrUpdateRecentUser,
  setPermissions,
  setSearchQuery,
  setChats,
  appendPreviousChats,
  appendNextChats,
  setCurrentCallCount,
  addLoadedCallCount,
  setHasMorePrevious,
  setHasMoreNext,
  setIsLoadingMessages,
  setSelectedChatId,
  setError,
  resetChatState,
  addOptimisticMessage,
  updateMessageStatus,
  updateMessageAttachments,
  setTypingStatus,
} = chatSlice.actions;

export default chatSlice.reducer;

export const chatSelector = (state: RootState) => state.chat;
