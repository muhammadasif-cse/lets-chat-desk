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
  const { handleGetChats, isLoading, clearMessages } = useGetChats();
  const { chats } = useAppSelector((state) => state.chat);
  const [selectedChat, setSelectedChat] = useState<ISelectedChat | null>(null);

  // Use refs to store the latest functions to avoid dependency issues
  const handleGetChatsRef = useRef(handleGetChats);
  const clearMessagesRef = useRef(clearMessages);

  // Update refs when functions change
  handleGetChatsRef.current = handleGetChats;
  clearMessagesRef.current = clearMessages;

  const currentUserId = 1;

  // Remove excessive logging to reduce console noise
  // console.log("selectedUser", selectedUser);
  // console.log("chats from redux", chats);

  useEffect(() => {
    console.log("useEffect triggered with selectedUser:", selectedUser);

    if (selectedUser) {
      console.log(
        "Clearing messages and setting up new chat for:",
        selectedUser.name
      );
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

      console.log("Fetching chats with params:", requestParams);
      handleGetChatsRef.current(requestParams);
    } else {
      console.log("No user selected, clearing state");
      clearMessagesRef.current();
      setSelectedChat(null);
    }
  }, [selectedUser]); // Only selectedUser as dependency

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
      <div className="h-full flex items-center justify-center">
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

  // Sample users for the chat
  const sampleUsers: IChatUser[] = [
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
          users={sampleUsers}
          currentUserId={currentUserId.toString()}
          onSendMessage={handleSendMessage}
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
