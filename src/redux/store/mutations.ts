// /* eslint-disable object-curly-spacing */
// /* eslint-disable prettier/prettier */
// "use client";

// import APIHeader from "@/redux/APIHeader";
// import {IGroup} from "@/app/(directory)/chat/interfaces/group";
// import {IGotoSpecificMessage} from "../interfaces/chat";

// const CHAT_SERVICE_API_URL = `${process.env.API_BASE_URL}/chatService`;

// const apiTag = APIHeader.enhanceEndpoints({
//   addTagTypes: ["chatService"],
// });

// export const ChatMutation = apiTag.injectEndpoints({
//   endpoints: (builder: any) => ({
//     getChats: builder.mutation({
//       query: (body: {userId: number; toUserId: number; groupId: string; type: string}) => ({
//         url: `${CHAT_SERVICE_API_URL}/chats/GetChats`,
//         method: "POST",
//         body: body,
//       }),
//     }),

//     getRecentChatUsers: builder.mutation({
//       query: () => ({
//         url: `${CHAT_SERVICE_API_URL}/chats/GetRecentChat`,
//         method: "GET",
//       }),
//     }),
//     getAdminByGroupId: builder.mutation({
//       query: (groupId: string) => ({
//         url: `${CHAT_SERVICE_API_URL}/group/GetAdminByGroupId?groupId=${groupId}`,
//         method: "GET",
//       }),
//     }),
//     getGroupMemberInfo: builder.mutation({
//       query: (groupId: string) => ({
//         url: `${CHAT_SERVICE_API_URL}/group/GetMemberInfo?groupId=${groupId}`,
//         method: "GET",
//       }),
//     }),
//     removeGroupMember: builder.mutation({
//       query: (data: {groupId: string; userId: number}) => ({
//         url: `${CHAT_SERVICE_API_URL}/Group/RemoveMember?groupId=${data.groupId}&userId=${data.userId}`,
//         method: "DELETE",
//       }),
//     }),

//     leaveGroup: builder.mutation({
//       query: (data: {groupId: string; userId: number}) => ({
//         url: `${CHAT_SERVICE_API_URL}/Group/LeaveGroup?groupId=${data.groupId}&userId=${data.userId}`,
//         method: "DELETE",
//       }),
//     }),

//     deleteGroup: builder.mutation({
//       query: (groupId: string) => ({
//         url: `${CHAT_SERVICE_API_URL}/Group/Delete?groupId=${groupId}`,
//         method: "DELETE",
//       }),
//     }),

//     deleteGroupConfirm: builder.mutation({
//       query: (groupId: string) => ({
//         url: `${CHAT_SERVICE_API_URL}/Group/DeleteConfirm?groupId=${groupId}`,
//         method: "DELETE",
//       }),
//     }),

//     createGroup: builder.mutation({
//       query: (data: IGroup) => ({
//         url: `${CHAT_SERVICE_API_URL}/Group/Create`,
//         method: "POST",
//         body: data,
//       }),
//     }),
//     updateGroup: builder.mutation({
//       query: (data: IGroup) => ({
//         url: `${CHAT_SERVICE_API_URL}/Group/Update`,
//         method: "PUT",
//         body: data,
//       }),
//     }),

//     updateMemberPermission: builder.mutation({
//       query: (data: {
//         groupId: string;
//         userId: number;
//         isAdmin?: boolean;
//         isEditGroupSettings?: boolean;
//         isSendMessages?: boolean;
//         isAddMembers?: boolean;
//       }) => ({
//         url: `${CHAT_SERVICE_API_URL}/Group/UpdateMemberPermission`,
//         method: "PUT",
//         body: data,
//       }),
//     }),

//     getGroupDetails: builder.mutation({
//       query: (data: IGroup) => ({
//         url: `${CHAT_SERVICE_API_URL}/Group/GetGroupDetails?groupId=${data}`,
//         method: "GET",
//       }),
//     }),

//     addMember: builder.mutation({
//       query: (data: IGroup) => ({
//         url: `${CHAT_SERVICE_API_URL}/Group/AddMember`,
//         method: "POST",
//         body: data,
//       }),
//     }),
//     uploadChatFile: builder.mutation({
//       query: (data: any) => ({
//         url: `${CHAT_SERVICE_API_URL}/chats/uploadAttachment`,
//         method: "POST",
//         body: data,
//       }),
//     }),
//     downloadChatFile: builder.mutation({
//       query: (data: any) => ({
//         url: `${CHAT_SERVICE_API_URL}/chats/downloadAttachment?attachmentId=${data}`,
//         method: "POST",
//       }),
//     }),

//     filterMessage: builder.mutation({
//       query: (data: any) => ({
//         url: `${CHAT_SERVICE_API_URL}/Chats/FilterMessage`,
//         method: "POST",
//         body: data,
//       }),
//     }),

//     searchMessage: builder.mutation({
//       query: (data: any) => ({
//         url: `${CHAT_SERVICE_API_URL}/Chats/SearchMessage`,
//         method: "POST",
//         body: data,
//       }),
//     }),
//     getGotoSpecificMessage: builder.mutation({
//       query: (data: IGotoSpecificMessage) => ({
//         url: `${CHAT_SERVICE_API_URL}/Chats/GotoSpecificMessage`,
//         method: "POST",
//         body: data,
//       }),
//     }),
//     getMessageInfo: builder.mutation({
//       query: ({messageId, type}: {messageId: string; type: string}) => ({
//         url: `${CHAT_SERVICE_API_URL}/chats/GetMessageInfo?messageId=${messageId}&type=${type}`,
//         method: "GET",
//       }),
//     }),
//   }),
// });

// export const {
//   useGetChatsMutation,
//   useGetRecentChatUsersMutation,
//   useGetAdminByGroupIdMutation,
//   useGetGroupMemberInfoMutation,
//   useCreateGroupMutation,
//   useUpdateGroupMutation,
//   useAddMemberMutation,
//   useUploadChatFileMutation,
//   useDownloadChatFileMutation,
//   useFilterMessageMutation,
//   useSearchMessageMutation,
//   useGetMessageInfoMutation,
//   useGetGotoSpecificMessageMutation,
//   useDeleteGroupMutation,
//   useDeleteGroupConfirmMutation,
//   useRemoveGroupMemberMutation,
//   useLeaveGroupMutation,
//   useGetGroupDetailsMutation,
//   useUpdateMemberPermissionMutation,
// } = ChatMutation;

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

    getRecentChatUsers: builder.mutation({
      query: () => ({
        url: `/chatservice/chats/GetRecentChat`,
        method: EAPI_METHODS.GET,
      }),
    }),
  }),
});

export const { useGetRecentChatUsersMutation, useGetChatsMutation } =
  ChatMutations;
