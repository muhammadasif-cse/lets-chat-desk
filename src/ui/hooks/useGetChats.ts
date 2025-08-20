import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { IChatApiResponse, IGetChatsRequest } from "../../interfaces/chat";
import { AppDispatch } from "../../redux/store";
import { setChats } from "../../redux/store/actions";
import { useGetChatsMutation } from "../../redux/store/mutations";

export const useGetChats = (): {
  handleGetChats: (params: IGetChatsRequest) => Promise<void>;
  isLoading: boolean;
  clearMessages: () => void;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const [getChats, { isLoading }] = useGetChatsMutation();

  const clearMessages = useCallback(() => {
    dispatch(setChats([]));
  }, [dispatch]);

  const handleGetChats = useCallback(
    async ({
      groupId,
      toUserId,
      type,
      userId,
      callCount,
    }: IGetChatsRequest) => {
      if (isLoading) {
        return;
      }
      if (!userId && !toUserId && !groupId) {
        toast.warning("Invalid parameters provided for fetching chat.");
        return;
      }

      dispatch(setChats([]));

      const reqBody: IGetChatsRequest = {
        groupId: type === "group" ? groupId : null,
        userId: type === "user" ? userId : null,
        toUserId: type === "user" ? toUserId : null,
        type: type,
        callCount: callCount,
      };

      try {
        const response = await getChats(reqBody).unwrap();
        const { code, result } = response as IChatApiResponse;

        if (code === 200 && Array.isArray(result.messages)) {
          dispatch(setChats(result.messages));
        }
      } catch (error) {
        toast.error(
          (error as any)?.data?.message ||
            (error as any).message ||
            "Something went wrong"
        );
      }
    },
    [dispatch, isLoading, getChats]
  );

  return { handleGetChats, isLoading, clearMessages };
};
