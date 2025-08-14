/* eslint-disable object-curly-spacing */
/* eslint-disable prettier/prettier */
"use client";

import { createSlice } from "@reduxjs/toolkit";

import initialState from "./state";

export const throughoutAction = createSlice({
  name: "throughout",
  initialState,
  reducers: {
    // setState: (state, action) => {
    //   state.state = action.payload;
    // },
  },
});

export const {
  // export
} = throughoutAction.actions;

export default throughoutAction;
