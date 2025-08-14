import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import APIHeader from "./APIHeader";
import throughoutAction from "./shared/action";

const store = configureStore({
  reducer: {
    [APIHeader.reducerPath]: APIHeader.reducer,
    menu: throughoutAction.reducer,
  },
  devTools: import.meta.env.NODE_ENV != "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat([APIHeader.middleware]),
});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
