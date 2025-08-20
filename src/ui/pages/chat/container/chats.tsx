import { useEffect, useRef, useState } from "react";

import {
  IChatItem,
  IChatUser,
  IGetChatsRequest,
  IMessage,
  ISelectedChat,
  ISendMessageData,
} from "../../../../interfaces/chat";
import { useAppSelector } from "../../../../redux/selector";
import { useGetChats } from "../../../hooks/useGetChats";
import ChatContainer from "../components/chat-container";
import Loading from "../utils/loading";

interface ChatsProps {
  selectedUser?: IChatItem;
}

const Chats = ({ selectedUser }: ChatsProps) => {
  const { 
    handleGetChats, 
    handleLoadPreviousMessages,
    handleLoadNextMessages,
    isLoading, 
    clearMessages 
  } = useGetChats();
  
  const { 
    chats, 
    currentCallCount, 
    hasMorePrevious,
    hasMoreNext,
    loadedCallCounts
  } = useAppSelector((state) => state.chat);
  
  const [selectedChat, setSelectedChat] = useState<ISelectedChat | null>(null);
  const [chatParams, setChatParams] = useState<Omit<IGetChatsRequest, 'callCount'> | null>(null);

  const handleGetChatsRef = useRef(handleGetChats);
  const clearMessagesRef = useRef(clearMessages);

  handleGetChatsRef.current = handleGetChats;
  clearMessagesRef.current = clearMessages;

  const currentUserId = 1;

  useEffect(() => {
    if (selectedUser) {
      clearMessagesRef.current();
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

      console.log("Fetching chats with params:", requestParams);
      handleGetChatsRef.current(requestParams);
    } else {
      console.log("No user selected, clearing state");
      clearMessagesRef.current();
      setSelectedChat(null);
      setChatParams(null);
    }
  }, [selectedUser]);

  const handleLoadPrevious = async (callCount: number): Promise<boolean> => {
    if (!chatParams) return false;
    return await handleLoadPreviousMessages(callCount, chatParams);
  };

  const handleLoadNext = async (callCount: number): Promise<boolean> => {
    if (!chatParams) return false;
    return await handleLoadNextMessages(callCount, chatParams);
  };

  const handleSendMessage = (messageData: ISendMessageData) => {
    if (!selectedChat) return;

    console.log("Sending message:", messageData);

    const newMessage: IMessage = {
      messageId: Date.now().toString(),
      message: messageData.text,
      date: new Date().toISOString(),
      senderName: "You",
      userId: currentUserId,
      toUserId: selectedChat.type === "user" ? parseInt(selectedChat.id) : 0,
      status: "sending",
      type: selectedChat.type,
      isApprovalNeeded: false,
      isNotification: false,
      parentMessageId: messageData.replyTo?.messageId || null,
      parentMessageText: messageData.replyTo?.text || null,
      reactions: [],
      attachments: messageData.attachments || [],
      eligibleUsers: null,
      deleteRequestedAt: null,
    };
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
      {isLoading ? (
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
          onBack={() => console.log("Back pressed")}
          onCall={() => console.log("Call pressed")}
          onVideoCall={() => console.log("Video call pressed")}
          onSearch={() => console.log("Search pressed")}
          onInfo={() => console.log("Info pressed")}
        />
      )}
    </div>
  );
};

export default Chats;
