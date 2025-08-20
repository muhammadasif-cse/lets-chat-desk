import { useEffect, useState } from "react";

import {
  IChatMessage,
  IChatUser,
  IMessageMention,
  IMessageReply,
  ISelectedChat,
} from "../../../../interfaces/chat";
import ChatContainer from "../components/chat-container";

interface ChatsProps {
  selectedUser?: any;
}

const sampleUsers: IChatUser[] = [
  {
    id: "1",
    name: "John Doe",
    photo: "https://example.com/photo1.jpg",
    type: "user",
  },
  {
    id: "2",
    name: "Jane Smith",
    photo: "https://example.com/photo2.jpg",
    type: "user",
  },
  {
    id: "3",
    name: "Team Group",
    type: "group",
  },
];

const Chats = ({ selectedUser }: ChatsProps) => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [selectedChat, setSelectedChat] = useState<ISelectedChat | null>(null);
  console.log("selectedUser", selectedUser);

  useEffect(() => {
    if (selectedUser) {
      const isGroup = selectedUser.type === "group";
      const sampleMessages: IChatMessage[] = [
        {
          id: "1",
          text: `Hey! How are you doing?`,
          timestamp: "2024-08-18T10:00:00Z",
          isOwn: false,
          isGroup,
          senderName: selectedUser.name || selectedUser.groupName,
          senderId: selectedUser.id.toString(),
          status: "read",
        },
        {
          id: "2",
          text: "I'm doing great! Thanks for asking 😊",
          timestamp: "2024-08-18T10:05:00Z",
          isOwn: true,
          isGroup,
          senderName: "You",
          senderId: "current-user",
          status: "read",
        },
        {
          id: "3",
          text: isGroup
            ? "Welcome to the group everyone! 🎉"
            : "That's awesome to hear!",
          timestamp: "2024-08-18T10:07:00Z",
          isOwn: false,
          isGroup,
          senderName: selectedUser.name || selectedUser.groupName,
          senderId: selectedUser.id.toString(),
          status: "read",
        },
        {
          id: "4",
          text: isGroup
            ? "Thanks! Excited to be here 🚀"
            : "Let's catch up soon!",
          timestamp: "2024-08-18T10:10:00Z",
          isOwn: true,
          isGroup,
          senderName: "You",
          senderId: "current-user",
          status: "delivered",
        },
        {
          id: "5",
          text: isGroup
            ? "Feel free to share any ideas or questions"
            : "Absolutely! Looking forward to it 👍",
          timestamp: "2024-08-18T10:15:00Z",
          isOwn: false,
          isGroup,
          senderName: selectedUser.name || selectedUser.groupName,
          senderId: selectedUser.id.toString(),
          status: "sent",
        },
      ];

      setMessages(sampleMessages);

      const chat: ISelectedChat = {
        id: selectedUser.id.toString(),
        name: selectedUser.name || selectedUser.groupName,
        photo: selectedUser.photo,
        type: selectedUser.type,
        isOnline: selectedUser.isOnline || false,
        memberCount: selectedUser.type === "group" ? 5 : undefined,
      };

      setSelectedChat(chat);
    }
  }, [selectedUser]);

  const handleSendMessage = (messageData: {
    text: string;
    mentions: IMessageMention[];
    replyTo?: IMessageReply;
  }) => {
    if (!selectedChat) return;

    const newMessage: IChatMessage = {
      id: Date.now().toString(),
      text: messageData.text,
      timestamp: new Date().toISOString(),
      isOwn: true,
      isGroup: selectedChat.type === "group",
      senderName: "You",
      senderId: "current-user",
      status: "sending",
      mentions: messageData.mentions,
      replyTo: messageData.replyTo,
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: "delivered" as const }
            : msg
        )
      );
    }, 2000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "read" as const } : msg
        )
      );
    }, 3000);
  };

  if (!selectedChat) {
    return null;
  }

  return (
    <div className="h-full">
      <ChatContainer
        selectedChat={selectedChat}
        messages={messages}
        users={sampleUsers}
        currentUserId="current-user"
        onSendMessage={handleSendMessage}
        onBack={() => console.log("Back pressed")}
        onCall={() => console.log("Call pressed")}
        onVideoCall={() => console.log("Video call pressed")}
        onSearch={() => console.log("Search pressed")}
        onInfo={() => console.log("Info pressed")}
      />
    </div>
  );
};

export default Chats;
