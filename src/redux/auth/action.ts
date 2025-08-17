/** @format */

import { createSlice } from "@reduxjs/toolkit";

import initialState from "./state";
import { RootState } from "../store";

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.isAuthenticated = !!(token && user);
      state.token = token || "";
      state.user = user || null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = "";
      state.user = null;
    },
    syncAuthFromCookies: (state, action) => {
      const { isLoggedIn, userData } = action.payload;
      state.isAuthenticated = isLoggedIn;
      state.token = userData?.token || "";
      state.user = userData
        ? {
            userId: userData.userId,
            fullName: userData.fullName,
            userName: userData.userName,
            photo: userData.photo,
            roleOrder: userData.roleOrder,
            branchId: userData.branchId,
            departmentId: userData.departmentId,
            services: userData.services || [],
          }
        : null;
    },
  },
});

export const { setCredentials, logout, syncAuthFromCookies } =
  authSlice.actions;

export default authSlice.reducer;

export const authSelector = (state: RootState) => state.auth;
