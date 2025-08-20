/** @format */

import EAPI_METHODS from "../../enums/api-methods";
import APIHeader from "../APIHeader";

const apiTag = APIHeader.enhanceEndpoints({
  addTagTypes: ["Chat"],
});

export const ChatMutations = apiTag.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.mutation({
      query: (body: {
        userId: number;
        toUserId: number;
        groupId: string;
        type: string;
      }) => ({
        url: `/chatservice/chats/GetChats`,
        method: "POST",
        body: body,
      }),
    }),

    getRecentUsers: builder.mutation({
      query: () => ({
        url: `/chatservice/chats/GetRecentChat`,
        method: EAPI_METHODS.GET,
      }),
    }),
  }),
});

export const { useGetRecentUsersMutation, useGetChatsMutation } = ChatMutations;
