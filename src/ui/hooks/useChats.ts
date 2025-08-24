import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { CHAT_CONFIG } from "../../constants/app.constants";
import {
  IChatItem,
  IGetChatsRequest
} from "../../interfaces/chat";
import { RootState } from "../../redux/store";
import {
  addLoadedCallCount,
  appendNextChats,
  appendPreviousChats,
  resetChatState,
  setChats,
  setCurrentCallCount,
  setError,
  setHasMoreNext,
  setHasMorePrevious,
  setIsLoadingMessages,
  setSelectedChatId
} from "../../redux/store/actions";
import { useGetChatsMutation } from "../../redux/store/mutations";

export const useChat = () => {
  const dispatch = useDispatch();
  const [getChatsMutation] = useGetChatsMutation();
  const {
    chats,
    currentCallCount,
    hasMorePrevious,
    hasMoreNext,
    loadedCallCounts,
    isLoadingMessages,
    selectedChatId,
    error,
  } = useSelector((state: RootState) => state.chat);

  const isLoadingRef = useRef(false);
  const currentChatIdRef = useRef<string | null>(null);

  const loadChats = useCallback(
    async (params: IGetChatsRequest): Promise<boolean> => {
      if (isLoadingRef.current) return false;

      try {
        isLoadingRef.current = true;
        dispatch(setIsLoadingMessages(true));
        dispatch(setError(null));

        const response = await getChatsMutation(params).unwrap();

        if (response.code === 200 && Array.isArray(response.result.messages)) {
          const messages = response.result.messages;

          if (params.callCount === 0) {
            dispatch(setChats(messages));
            dispatch(setCurrentCallCount(response.result.count));
            dispatch(
              setHasMorePrevious(messages.length >= CHAT_CONFIG.PAGE_SIZE)
            );
            dispatch(setHasMoreNext(response.result.count > 0));
          } else if (params.callCount > currentCallCount) {
            dispatch(appendPreviousChats(messages));
            dispatch(
              setHasMorePrevious(messages.length >= CHAT_CONFIG.PAGE_SIZE)
            );
          } else {
            dispatch(appendNextChats(messages));
            dispatch(
              setHasMoreNext(messages.length > 0 && params.callCount > 0)
            );
          }

          dispatch(addLoadedCallCount(params.callCount));
          return true;
        }

        return false;
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return false;
        }

        const errorMessage =
          (error as any)?.data?.message ||
          (error instanceof Error ? error.message : "Failed to load messages");
        dispatch(setError(errorMessage));
        toast.error(errorMessage);
        return false;
      } finally {
        isLoadingRef.current = false;
        dispatch(setIsLoadingMessages(false));
      }
    },
    [dispatch, getChatsMutation, currentCallCount]
  );

  const initializeChat = useCallback(
    async (chatItem: IChatItem, userId: number) => {
      if (currentChatIdRef.current === chatItem.id) {
        return;
      }

      currentChatIdRef.current = chatItem.id;
      dispatch(setSelectedChatId(chatItem.id));
      dispatch(resetChatState());

      const params: IGetChatsRequest = {
        groupId: chatItem.type === "group" ? chatItem.id : null,
        toUserId: chatItem.type === "user" ? parseInt(chatItem.id) : null,
        userId,
        type: chatItem.type,
        callCount: 0,
      };

      await loadChats(params);
    },
    [dispatch, loadChats]
  );

  const loadPreviousMessages = useCallback(
    async (
      callCount: number,
      chatParams: Omit<IGetChatsRequest, "callCount">
    ): Promise<boolean> => {
      if (loadedCallCounts.includes(callCount) || isLoadingMessages) {
        return false;
      }

      return loadChats({ ...chatParams, callCount });
    },
    [loadChats, loadedCallCounts, isLoadingMessages]
  );

  const loadNextMessages = useCallback(
    async (
      callCount: number,
      chatParams: Omit<IGetChatsRequest, "callCount">
    ): Promise<boolean> => {
      if (
        loadedCallCounts.includes(callCount) ||
        isLoadingMessages ||
        callCount < 0
      ) {
        return false;
      }

      return loadChats({ ...chatParams, callCount });
    },
    [loadChats, loadedCallCounts, isLoadingMessages]
  );

  const clearChat = useCallback(() => {
    dispatch(resetChatState());
    dispatch(setSelectedChatId(null));
    currentChatIdRef.current = null;
  }, [dispatch]);

  return {
    // State
    chats,
    currentCallCount,
    hasMorePrevious,
    hasMoreNext,
    loadedCallCounts,
    isLoadingMessages,
    selectedChatId,
    error,

    // Actions
    initializeChat,
    loadPreviousMessages,
    loadNextMessages,
    clearChat,
  };
};

export default useChat;
