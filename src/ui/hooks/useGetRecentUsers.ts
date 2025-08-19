import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { IRecentChatUsers } from "../../interfaces/user";
import { useAppSelector } from "../../redux/selector";
import { AppDispatch } from "../../redux/store";
import { setPermission, setRecentChatUsers } from "../../redux/store/actions";
import { useGetRecentChatUsersMutation } from "../../redux/store/mutations";
import { TChatPermissions } from "../../redux/store/state";
import { TResponse } from "../types/api-response.type";
import { TRecentChat } from "../types/chat-api-response.type";

export const useGetRecentUsers = (): {
  handleRecentChatUsers: () => Promise<void>;
  isLoading: boolean;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const [getRecentChatUsers, { isLoading }] = useGetRecentChatUsersMutation();
  const { recentChatUsers } = useAppSelector((state) => state.chat);
  const hasFetchedRef = useRef(false);

  const handleRecentChatUsers = useCallback(async () => {
    if (hasFetchedRef.current || isLoading || recentChatUsers.length > 0) {
      return;
    }

    hasFetchedRef.current = true;

    try {
      const response = await getRecentChatUsers("").unwrap();
      const { code, result } = response as TResponse<TRecentChat>;
      console.log("🚀 ~ useGetRecentUsers ~ data:", result);

      if (code === 200 && Array.isArray(result)) {
        const permissions: TChatPermissions[] = result.map(
          (item: TRecentChat) => ({
            id: item.id,
            isEditGroupSettings: item.isEditGroupSettings,
            isSendMessages: item.isSendMessages,
            isAddMembers: item.isAddMembers,
            isAdmin: item.isAdmin,
            hasDeleteRequest: item.hasDeleteRequest,
          })
        );

        const chatUsers: IRecentChatUsers[] = result.map(
          (item: TRecentChat) => ({
            id: parseInt(item.id) || 0,
            name: item.name,
            message: item.lastMessage,
            photo: item.photo,
            lastMessageDate: item.lastMessageDate,
            lastMessageId: item.lastMessageId,
            unreadCount: item.unreadCount,
            type: item.type,
            groupId: item.type === "group" ? item.id : null,
            groupName: item.type === "group" ? item.name : null,
            lastMessage: item.lastMessage,
            description: item.description,
            tags: [],
            attachments: [],
            date: item.lastMessageDate,
            userId: item.type === "user" ? parseInt(item.id) : undefined,
            toUserId: undefined,
            isSeen: item.unreadCount === 0,
            isTyping: false,
            isOnline: false,
            isApprovalNeeded: false,
            isAdmin: item.isAdmin,
            isEditGroupSettings: item.isEditGroupSettings,
            isSendMessages: item.isSendMessages,
            isAddMembers: item.isAddMembers,
            hasDeleteRequest: item.hasDeleteRequest,
          })
        );

        dispatch(setPermission(permissions));
        dispatch(setRecentChatUsers(chatUsers));
      }
    } catch (error) {
      hasFetchedRef.current = false;
      toast.error(
        (error as any)?.data?.message ||
          (error as any).message ||
          "Something went wrong"
      );
    }
  }, [dispatch, isLoading, recentChatUsers.length]);

  return { handleRecentChatUsers, isLoading };
};
