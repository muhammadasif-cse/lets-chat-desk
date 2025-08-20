import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { IMessage } from "../../interfaces/message";
import { useAppSelector } from "../../redux/selector";
import { AppDispatch } from "../../redux/store";
import { setChats } from "../../redux/store/actions";
import { useGetChatsMutation } from "../../redux/store/mutations";
import { TResponse } from "../types/api-response.type";

export const useGetChats = (): {
  handleGetChats: (params: IGetChats) => Promise<void>;
  isLoading: boolean;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const [getChats, { isLoading }] = useGetChatsMutation();
  const { chats } = useAppSelector((state) => state.chat);
  const hasFetchedRef = useRef(false);

  const handleGetChats = useCallback(
    async ({ groupId, toUserId, type, userId, callCount }: IGetChats) => {
      if (hasFetchedRef.current || isLoading || chats.length > 0) {
        return;
      }
      if (!userId && !toUserId && !groupId) {
        toast.warning("Invalid parameters provided for fetching chat.");
        return;
      }
      hasFetchedRef.current = true;

      const reqBody = {
        groupId: type === "group" ? groupId : null,
        userId: type === "user" ? userId : null,
        toUserId: type === "user" ? toUserId : null,
        type: type,
        callCount: callCount,
      };

      try {
        const response = await getChats(reqBody as IGetChats).unwrap();
        const { code, result } = response as TResponse<IMessage>;

        if (code === 200 && Array.isArray(result)) {
          dispatch(setChats(result as IMessage[]));
        }
      } catch (error) {
        hasFetchedRef.current = false;
        toast.error(
          (error as any)?.data?.message ||
            (error as any).message ||
            "Something went wrong"
        );
      }
    },
    [dispatch, isLoading]
  );

  return { handleGetChats, isLoading };
};
