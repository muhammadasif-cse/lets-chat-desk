import { useEffect, useRef, useState } from "react";

import useAuth from "@/ui/hooks/useAuth";
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
  signalR: any;
}

const Chats = ({ selectedUser, signalR }: ChatsProps) => {
  const { user } = useAuth();
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
    clearChat,
  } = useChat();

  const [selectedChat, setSelectedChat] = useState<ISelectedChat | null>(null);
  const [chatParams, setChatParams] = useState<Omit<
    IGetChatsRequest,
    "callCount"
  > | null>(null);

  const initializeChatRef = useRef(initializeChat);
  const clearChatRef = useRef(clearChat);

  initializeChatRef.current = initializeChat;
  clearChatRef.current = clearChat;

  const currentUserId = user?.userId || 1;
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (selectedUser) {
      const chat: ISelectedChat = {
        id: selectedUser.id,
        name: selectedUser.name,
        photo: selectedUser.photo,
        type: selectedUser.type,
        isOnline: selectedUser.type === "user" ? true : false,
        memberCount:
          selectedUser.type === "group" ? selectedUser.memberCount : undefined,
        lastMessage: selectedUser.lastMessage,
        lastMessageId: selectedUser.lastMessageId,
        lastMessageDate: selectedUser.lastMessageDate,
        unreadCount: selectedUser.unreadCount,
        isAdmin: selectedUser.isAdmin,
        isEditGroupSettings: selectedUser.isEditGroupSettings,
        isSendMessages: selectedUser.isSendMessages,
        isAddMembers: selectedUser.isAddMembers,
        hasDeleteRequest: selectedUser.hasDeleteRequest,
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
      setChatParams({
        groupId: requestParams.groupId,
        toUserId: requestParams.toUserId,
        userId: requestParams.userId,
        type: requestParams.type,
      });

      initializeChatRef.current(selectedUser, currentUserId, signalR);
    } else {
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

    signalR.sendMessage(
      messageData,
      selectedChat.id,
      currentUserId,
      selectedChat.type
    );
  };

  const handleTyping = (isTyping: boolean) => {
    if (!selectedChat?.id || !user?.userId) return;
  
    if (isTypingRef.current !== isTyping) {
      signalR.typingStatus(
        user.userId,
        selectedChat.id,
        isTyping,
        selectedChat.type,
        selectedChat.id?.toString() ?? "",
      );
      isTypingRef.current = isTyping;
    }
  };

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center bg-foreground">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray2">No chat selected</h3>
          <p className="text-gray">Select a conversation to start chatting</p>
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
          onTyping={handleTyping}
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
