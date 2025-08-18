import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { useGetChatsMutation } from "../../redux/store/mutations";
import { useAppSelector } from "../../redux/selector";
import { GetChatsParams } from "../../interfaces/chat";
import { toast } from "sonner";
import { TResponse } from "../types/api-response.type";
import { IMessage } from "../../interfaces/message";
import {
  appendMessages,
  setHasReachedEndOfNewerMessages,
  setHasReachedEndOfOlderMessages,
  setMessages,
  setSelectedUserInfo,
  setTotalGroupOnline,
} from "../../redux/store/actions";

export const useHandleGetChat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [getChats, get_chat] = useGetChatsMutation();
  const { messages, selectedUserInfo } = useAppSelector((state) => state.chat);

  const handleGetChat = async ({
    userId,
    toUserId,
    groupId,
    type,
    userInfo,
    callCount,
    mode,
  }: GetChatsParams) => {
    if (
      callCount === 0 &&
      mode !== "replace" &&
      ((type === "user" && selectedUserInfo?.id === toUserId) ||
        (type === "group" && String(selectedUserInfo?.id) === String(groupId)))
    ) {
      return;
    }

    if (!userId && !toUserId && !groupId) {
      toast.error("Invalid parameters provided for fetching chat.");
      return;
    }
    const reqBody = {
      groupId: type === "group" ? groupId : null,
      userId: type === "user" ? userId : null,
      toUserId: type === "user" ? toUserId : null,
      type: type,
      callCount: callCount,
    };

    try {
      const response = await getChats(reqBody as any).unwrap();
      const { code, result } = response as TResponse<any>;
      if (code === 200 && Array.isArray((result as any)?.messages)) {
        const incomingMessages = (result as any)?.messages as IMessage[];

        dispatch(setTotalGroupOnline((result as any)?.totalOnline ?? 0));

        if (result as any) {
          if (incomingMessages.length === 0) {
            if (mode === "newer") {
              dispatch(setHasReachedEndOfNewerMessages(true));
            } else {
              dispatch(setHasReachedEndOfOlderMessages(true));
            }
          } else {
            if (mode === "newer") {
              dispatch(setHasReachedEndOfNewerMessages(false));
            } else {
              dispatch(setHasReachedEndOfOlderMessages(false));
            }
          }

          if (mode === "replace") {
            dispatch(setMessages(incomingMessages));
          } else if (mode === "newer") {
            dispatch(appendMessages(incomingMessages));
          } else {
            dispatch(setMessages([...incomingMessages, ...messages]));
          }
        }
        dispatch(
          setSelectedUserInfo({
            ...userInfo,
            id: (userInfo as any)?.id ?? (userInfo as any)?.userId,
            name: (userInfo as any)?.name ?? (userInfo as any)?.fullName ?? "",
            description: (result as any)?.description,
            isOnline: (result as any)?.isOnline,
            type: (userInfo as any)?.type ?? "user",
          })
        );
      }
    } catch (error) {
      toast.error(
        (error as any)?.data?.message ||
          (error as any)?.message ||
          "Something went wrong"
      );
    }
  };

  return { handleGetChat, get_chat };
};
