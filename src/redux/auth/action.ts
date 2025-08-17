/** @format */

import { createSlice } from "@reduxjs/toolkit";

import initialState from "./state";
import { RootState } from "../store";

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload?.token ?? "";
      state.auth = action.payload?.auth ?? null;
      state.permissions = action.payload?.permissions ?? [];
    },
    logout: (state) => {
      state.token = "";
      state.auth = null;
      state.permissions = [];
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

export const authSelector = (state: RootState) => state.auth;
