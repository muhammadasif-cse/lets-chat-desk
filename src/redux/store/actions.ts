import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IRecentUser } from "../../interfaces/user";
import { RootState } from "../store";
import initialState from "./state";
import { TChatPermissions } from "./state.interface";

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setRecentUsers: (state, action: PayloadAction<IRecentUser[]>) => {
      state.recentUsers = action.payload;
    },
    setPermissions: (state, action: PayloadAction<TChatPermissions[]>) => {
      state.permissions = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setRecentUsers, setPermissions, setSearchQuery } = chatSlice.actions;

export default chatSlice.reducer;

export const chatSelector = (state: RootState) => state.chat;
