import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { IChatApiResponse, IGetChatsRequest } from "../../interfaces/chat";
import { AppDispatch, RootState } from "../../redux/store";
import {
  addLoadedCallCount,
  appendNextChats,
  appendPreviousChats,
  resetChatState,
  setChats,
  setCurrentCallCount,
  setHasMoreNext,
  setHasMorePrevious,
  setIsLoadingMessages,
} from "../../redux/store/actions";
import { useGetChatsMutation } from "../../redux/store/mutations";

export const useGetChats = (): {
  handleGetChats: (params: IGetChatsRequest) => Promise<void>;
  handleLoadPreviousMessages: (
    callCount: number,
    chatParams: Omit<IGetChatsRequest, "callCount">
  ) => Promise<boolean>;
  handleLoadNextMessages: (
    callCount: number,
    chatParams: Omit<IGetChatsRequest, "callCount">
  ) => Promise<boolean>;
  isLoading: boolean;
  clearMessages: () => void;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const [getChats, { isLoading }] = useGetChatsMutation();
  const { loadedCallCounts, isLoadingMessages } = useSelector(
    (state: RootState) => state.chat
  );

  const clearMessages = useCallback(() => {
    dispatch(resetChatState());
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

      dispatch(setIsLoadingMessages(true));
      dispatch(resetChatState());

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
          dispatch(setCurrentCallCount(callCount));
          dispatch(addLoadedCallCount(callCount));

          // Set hasMorePrevious to true if we have messages and callCount > 0
          dispatch(
            setHasMorePrevious(result.messages.length > 0)
          );
          dispatch(setHasMoreNext(result.messages.length >= 20)); // Restore next loading
        } else {
          dispatch(setChats([]));
          dispatch(setCurrentCallCount(callCount));
          dispatch(addLoadedCallCount(callCount));
          dispatch(setHasMorePrevious(false));
          dispatch(setHasMoreNext(false));
        }
      } catch (error) {
        toast.error(
          (error as any)?.data?.message ||
            (error as any).message ||
            "Something went wrong"
        );
      } finally {
        dispatch(setIsLoadingMessages(false));
      }
    },
    [dispatch, isLoading, getChats]
  );

  const handleLoadPreviousMessages = useCallback(
    async (
      callCount: number,
      chatParams: Omit<IGetChatsRequest, "callCount">
    ): Promise<boolean> => {
      if (isLoading || isLoadingMessages) {
        console.log("Already loading, skipping previous messages request");
        return false;
      }
      if (loadedCallCounts.includes(callCount)) {
        console.log(
          `Call count ${callCount} already loaded, skipping previous messages request`
        );
        return false;
      }

      console.log(`Loading previous messages for callCount: ${callCount}`);
      dispatch(setIsLoadingMessages(true));

      const reqBody: IGetChatsRequest = {
        ...chatParams,
        callCount: callCount,
      };

      try {
        const response = await getChats(reqBody).unwrap();
        const { code, result } = response as IChatApiResponse;

        if (
          code === 200 &&
          Array.isArray(result.messages) &&
          result.messages.length > 0
        ) {
          console.log(`Loaded ${result.messages.length} previous messages`);
          dispatch(appendPreviousChats(result.messages));
          dispatch(addLoadedCallCount(callCount));
          dispatch(setHasMorePrevious(result.messages.length >= 20)); // Has more if we got a full page
          return true;
        }

        console.log("No more previous messages available");
        dispatch(setHasMorePrevious(false));
        dispatch(addLoadedCallCount(callCount)); // Mark as loaded even if no data
        return false;
      } catch (error) {
        console.error("Error loading previous messages:", error);
        toast.error(
          (error as any)?.data?.message ||
            (error as any).message ||
            "Failed to load previous messages"
        );
        return false;
      } finally {
        dispatch(setIsLoadingMessages(false));
      }
    },
    [dispatch, isLoading, isLoadingMessages, getChats, loadedCallCounts]
  );

  const handleLoadNextMessages = useCallback(
    async (
      callCount: number,
      chatParams: Omit<IGetChatsRequest, "callCount">
    ): Promise<boolean> => {
      if (isLoading || isLoadingMessages) {
        console.log("Already loading, skipping next messages request");
        return false;
      }

      if (loadedCallCounts.includes(callCount)) {
        console.log(
          `Call count ${callCount} already loaded, skipping next messages request`
        );
        return false;
      }

      console.log(`Loading next messages for callCount: ${callCount}`);
      dispatch(setIsLoadingMessages(true));

      const reqBody: IGetChatsRequest = {
        ...chatParams,
        callCount: callCount,
      };

      try {
        const response = await getChats(reqBody).unwrap();
        const { code, result } = response as IChatApiResponse;

        if (
          code === 200 &&
          Array.isArray(result.messages) &&
          result.messages.length > 0
        ) {
          console.log(`Loaded ${result.messages.length} next messages`);
          dispatch(appendNextChats(result.messages));
          dispatch(addLoadedCallCount(callCount));
          dispatch(setHasMoreNext(callCount > 0)); // Has more next if callCount > 0
          return true;
        }

        console.log("No more next messages available");
        dispatch(setHasMoreNext(false));
        dispatch(addLoadedCallCount(callCount)); // Mark as loaded even if no data
        return false;
      } catch (error) {
        console.error("Error loading next messages:", error);
        toast.error(
          (error as any)?.data?.message ||
            (error as any).message ||
            "Failed to load next messages"
        );
        return false;
      } finally {
        dispatch(setIsLoadingMessages(false));
      }
    },
    [dispatch, isLoading, isLoadingMessages, getChats, loadedCallCounts]
  );

  return {
    handleGetChats,
    handleLoadPreviousMessages,
    handleLoadNextMessages,
    isLoading,
    clearMessages,
  };
};
