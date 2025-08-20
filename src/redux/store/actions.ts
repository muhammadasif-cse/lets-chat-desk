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
    setPermissions: (state, action: PayloadAction<TChatPermissions[]>) => {
      state.permissions = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setChats: (state, action: PayloadAction<IMessage[]>) => {
      state.chats = action.payload;
    },
    appendPreviousChats: (state, action: PayloadAction<IMessage[]>) => {
      state.chats = [...action.payload, ...state.chats];
    },
    appendNextChats: (state, action: PayloadAction<IMessage[]>) => {
      state.chats = [...state.chats, ...action.payload];
    },
    setCurrentCallCount: (state, action: PayloadAction<number>) => {
      state.currentCallCount = action.payload;
    },
    addLoadedCallCount: (state, action: PayloadAction<number>) => {
      if (!state.loadedCallCounts.includes(action.payload)) {
        state.loadedCallCounts.push(action.payload);
      }
    },
    setLoadedCallCounts: (state, action: PayloadAction<number[]>) => {
      state.loadedCallCounts = action.payload;
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
    resetChatState: (state) => {
      state.chats = [];
      state.currentCallCount = 0;
      state.loadedCallCounts = [];
      state.hasMorePrevious = false;
      state.hasMoreNext = false;
      state.isLoadingMessages = false;
    },
  },
});

export const { 
  setRecentUsers, 
  setPermissions, 
  setSearchQuery, 
  setChats, 
  appendPreviousChats,
  appendNextChats,
  setCurrentCallCount,
  addLoadedCallCount,
  setLoadedCallCounts,
  setHasMorePrevious,
  setHasMoreNext,
  setIsLoadingMessages,
  resetChatState
} = chatSlice.actions;

export default chatSlice.reducer;

export const chatSelector = (state: RootState) => state.chat;
