import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../redux/selector";
import { useHandleGetChat } from "./useGetChat";
import {
  resetEndOfDataFlags,
  setCallCount,
  setInitialCallCount,
  updateRecentChatUsers,
} from "../../redux/store/actions";

export const useChatItemState = () => {
  const [onHover, setOnHover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState<string | null>(null);

  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedUserInfo, typingStatus, allActiveUsers } = useAppSelector(
    (state) => state.chat
  );
  const { handleGetChat } = useHandleGetChat();

  //* helper to setup draft message logic
  const setupDraftLogic = useCallback((draftKey: string) => {
    const updateDraft = (val?: string | null) => {
      setDraft(val ?? localStorage.getItem(draftKey) ?? null);
    };

    updateDraft();

    const onDraftChanged = (e: Event) => {
      const { key, value } = (e as CustomEvent).detail || {};
      if (key === draftKey) updateDraft(value);
    };

    window.addEventListener("draft-changed", onDraftChanged as EventListener);

    const onStorage = (e: StorageEvent) => {
      if (e.key === draftKey) updateDraft(e.newValue);
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(
        "draft-changed",
        onDraftChanged as EventListener
      );
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  //* helper to check if chat is typing
  const isChatTyping = useCallback(
    (chat: any) => {
      const isTyping =
        (typingStatus.key === "both" && typingStatus.isTyping === true) ||
        (typingStatus?.key === "left" && typingStatus?.isTyping === true);

      return (
        (typingStatus.type === "user" &&
          chat.id?.toString() === typingStatus.senderId?.toString() &&
          isTyping) ||
        (typingStatus.type === "group" &&
          chat.id?.toString() === typingStatus.groupId?.toString() &&
          isTyping)
      );
    },
    [typingStatus]
  );

  //* helper to render message preview
  const getMessagePreviewData = useCallback(
    (chat: any) => {
      const isTyping = isChatTyping(chat);

      if (isTyping) {
        if (
          chat.type === "group" &&
          typingStatus.type === "group" &&
          typingStatus.username
        ) {
          return { type: "group-typing", username: typingStatus.username };
        }
        return { type: "typing" };
      }

      if (chat.unreadCount === 0 && draft && selectedUserInfo.id !== chat.id) {
        return { type: "draft", content: draft };
      }

      return { type: "message", content: chat.lastMessage ?? "" };
    },
    [draft, selectedUserInfo.id, typingStatus, isChatTyping]
  );

  //* handle chat actions
  const handleChatActions = useCallback(
    async ({
      key,
      chat,
      markMultipleMessageAsSeen,
      onUserSelect,
      data,
    }: {
      key: string;
      chat: any;
      markMultipleMessageAsSeen?: (
        senderId: number,
        type: string,
        groupId: string | null
      ) => void;
      onUserSelect?: () => void;
      data?: any;
    }) => {
      if (onUserSelect) {
        onUserSelect();
      }

      switch (key) {
        case "get-chat":
          dispatch(setCallCount(0));
          dispatch(setInitialCallCount(0));
          dispatch(resetEndOfDataFlags());

          dispatch(
            updateRecentChatUsers({
              ...chat,
              unreadCount: 0,
            })
          );
          if (markMultipleMessageAsSeen) {
            markMultipleMessageAsSeen(
              Number(chat?.id ?? 0),
              chat?.type,
              chat?.type === "group" ? chat?.id?.toString() ?? "0" : null
            );
          }
          handleGetChat({
            userId: parseInt(user?.userId?.toString() ?? "0"),
            toUserId:
              chat?.type === "user" ? parseInt(chat?.id?.toString() ?? "0") : 0,
            userInfo: chat as any,
            groupId: chat?.type === "group" ? chat?.id?.toString() ?? "0" : "",
            type: chat?.type,
            callCount: 0,
            mode: "replace",
          });
          break;

        default:
          return { key, data }; //! return for external handling
      }
    },
    [dispatch, handleGetChat, user?.userId]
  );

  //* filter users based on search query
  const getFilteredUsers = useCallback(() => {
    return allActiveUsers.filter(
      (user: any) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allActiveUsers, searchQuery]);

  return {
    //* state
    onHover,
    setOnHover,
    searchQuery,
    setSearchQuery,
    draft,

    //* computed
    filteredUsers: getFilteredUsers(),

    //* selectors
    user,
    selectedUserInfo,

    //* featured methods
    setupDraftLogic,
    isChatTyping,
    getMessagePreviewData,
    handleChatActions,
  };
};
