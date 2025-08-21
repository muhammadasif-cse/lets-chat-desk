import { useEffect, useRef, useState } from "react";

import useChat from "@/ui/hooks/useChats";
import {
  IChatItem,
  IChatUser,
  IGetChatsRequest,
  ISelectedChat,
  ISendMessageData,
} from "../../../../interfaces/chat";
import ChatContainer from "../components/chat-container";
import Loading from "../utils/loading";

interface ChatsProps {
  selectedUser?: IChatItem;
}

const Chats = ({ selectedUser }: ChatsProps) => {
  const {
    chats,
    currentCallCount,
    hasMorePrevious,
    hasMoreNext,
    loadedCallCounts,
    isLoadingMessages,
    initializeChat,
    loadPreviousMessages,
    loadNextMessages,
    sendMessage,
    clearChat,
  } = useChat();

  const [selectedChat, setSelectedChat] = useState<ISelectedChat | null>(null);
  const [chatParams, setChatParams] = useState<Omit<
    IGetChatsRequest,
    "callCount"
  > | null>(null);

  const initializeChatRef = useRef(initializeChat);
  const clearChatRef = useRef(clearChat);
  const lastSelectedUserRef = useRef<IChatItem | undefined>(undefined);

  initializeChatRef.current = initializeChat;
  clearChatRef.current = clearChat;

  const currentUserId = 1;

  useEffect(() => {
    if (selectedUser) {
      if (
        lastSelectedUserRef.current &&
        lastSelectedUserRef.current.id === selectedUser.id &&
        lastSelectedUserRef.current.type === selectedUser.type
      ) {
        return;
      }

      lastSelectedUserRef.current = selectedUser;
      clearChatRef.current();

      const chat: ISelectedChat = {
        id: selectedUser.id,
        name: selectedUser.name,
        photo: selectedUser.photo,
        type: selectedUser.type,
        isOnline: selectedUser.type === "user" ? true : false,
        memberCount: selectedUser.type === "group" ? 0 : undefined,
      };
      setSelectedChat(chat);

      const requestParams: IGetChatsRequest = {
        groupId: selectedUser.type === "group" ? selectedUser.id : null,
        toUserId:
          selectedUser.type === "user" ? parseInt(selectedUser.id) : null,
        userId: currentUserId,
        type: selectedUser.type,
        callCount: 0,
      };

      // Store chat params for pagination
      setChatParams({
        groupId: requestParams.groupId,
        toUserId: requestParams.toUserId,
        userId: requestParams.userId,
        type: requestParams.type,
      });

      initializeChatRef.current(selectedUser, currentUserId);
    } else {
      lastSelectedUserRef.current = undefined;
      clearChatRef.current();
      setSelectedChat(null);
      setChatParams(null);
    }
  }, [selectedUser]);

  const handleLoadPrevious = async (callCount: number): Promise<boolean> => {
    if (!chatParams) return false;
    return await loadPreviousMessages(callCount, chatParams);
  };

  const handleLoadNext = async (callCount: number): Promise<boolean> => {
    if (!chatParams) return false;
    return await loadNextMessages(callCount, chatParams);
  };

  const handleSendMessage = (messageData: ISendMessageData) => {
    if (!selectedChat) return;

    sendMessage(messageData, selectedChat.id, currentUserId, selectedChat.type);
  };

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center bg-foreground">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No chat selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  const groupUsers: IChatUser[] = [
    {
      id: currentUserId.toString(),
      name: "Current User",
      type: "user",
    },
    {
      id: selectedChat.id,
      name: selectedChat.name,
      photo: selectedChat.photo,
      type: selectedChat.type,
      isOnline: selectedChat.isOnline,
    },
  ];

  return (
    <div className="h-full">
      {isLoadingMessages ? (
        <div className="h-full flex items-center justify-center bg-foreground">
          <Loading />
        </div>
      ) : (
        <ChatContainer
          selectedChat={selectedChat}
          messages={chats}
          users={groupUsers}
          currentUserId={currentUserId.toString()}
          currentCallCount={currentCallCount}
          hasMorePrevious={hasMorePrevious}
          hasMoreNext={hasMoreNext}
          loadedCallCounts={loadedCallCounts}
          onSendMessage={handleSendMessage}
          onLoadPreviousMessages={handleLoadPrevious}
          onLoadNextMessages={handleLoadNext}
          onBack={() => {
            /* //TODO: Implement back navigation */
          }}
          onCall={() => {
            /* //TODO: Implement voice call */
          }}
          onVideoCall={() => {
            /* //TODO: Implement video call */
          }}
          onSearch={() => {
            /* //TODO: Implement search functionality */
          }}
          onInfo={() => {
            /* //TODO: Implement user/group info */
          }}
        />
      )}
    </div>
  );
};

export default Chats;
