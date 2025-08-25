/** @format */

import { API_ENDPOINTS } from "../../constants/app.constants";
import EAPI_METHODS from "../../enums/api-methods";
import { IGetChatsRequest } from "../../interfaces/chat";
import APIHeader from "../APIHeader";

const apiTag = APIHeader.enhanceEndpoints({
  addTagTypes: ["Chat"],
});

export const ChatMutations = apiTag.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.mutation({
      query: (body: IGetChatsRequest) => ({
        url: API_ENDPOINTS.GET_CHATS,
        method: "POST",
        body: body,
      }),
    }),

    getRecentUsers: builder.mutation({
      query: () => ({
        url: API_ENDPOINTS.GET_RECENT_CHAT,
        method: EAPI_METHODS.GET,
      }),
    }),

    uploadChatFile: builder.mutation({
      query: (data: FormData) => ({
        url: API_ENDPOINTS.UPLOAD_CHAT_ATTACHMENT,
        method: "POST",
        body: data,
      }),
    }),

    getAdminByGroupId: builder.mutation({
      query: (groupId: string) => ({
        url: `${API_ENDPOINTS.GET_ADMIN_BY_GROUP_ID}?groupId=${groupId}`,
        method: "GET",
      }),
    }),

    getMessageInfo: builder.mutation({
      query: ({ messageId, type }: { messageId: string; type: string }) => ({
        url: `${API_ENDPOINTS.GET_MESSAGE_INFO}?messageId=${messageId}&type=${type}`,
        method: "GET",
      }),
    }),
  }),
});

export const { 
  useGetRecentUsersMutation, 
  useGetChatsMutation,
  useUploadChatFileMutation,
  useGetAdminByGroupIdMutation,
  useGetMessageInfoMutation
} = ChatMutations;
