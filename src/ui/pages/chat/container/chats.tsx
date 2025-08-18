import { useState } from "react";
import {
  IChatMessage,
  IChatUser,
  IMessageMention,
  IMessageReply,
  ISelectedChat,
} from "../../../interfaces/chat.interface";
import ChatContainer from "../components/chat-container";

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
const sampleMessages: IChatMessage[] = [
  {
    id: "1",
    text: "Hey everyone! How's the project going?",
    timestamp: "2024-08-18T10:00:00Z",
    isOwn: false,
    isGroup: true,
    senderName: "John Doe",
    senderId: "1",
    status: "read",
  },
  {
    id: "2",
    text: "Going well! @Jane Smith has been making great progress on the UI.",
    timestamp: "2024-08-18T10:05:00Z",
    isOwn: true,
    isGroup: true,
    senderName: "You",
    senderId: "current-user",
    status: "read",
    mentions: [
      {
        id: "2",
        name: "Jane Smith",
        start: 13,
        length: 10,
      },
    ],
  },
  {
    id: "3",
    text: "Thanks for the mention! The new design is looking great 🎨",
    timestamp: "2024-08-18T10:07:00Z",
    isOwn: false,
    isGroup: true,
    senderName: "Jane Smith",
    senderId: "2",
    status: "read",
    replyTo: {
      id: "2",
      text: "Going well! @Jane Smith has been making great progress on the UI.",
      senderName: "You",
    },
  },
  {
    id: "4",
    text: "Here's the latest mockup",
    timestamp: "2024-08-18T10:10:00Z",
    isOwn: false,
    isGroup: true,
    senderName: "Jane Smith",
    senderId: "2",
    status: "delivered",
    attachment: {
      type: "image",
      url: "https://example.com/mockup.jpg",
    },
  },
  {
    id: "5",
    text: "Looks amazing! When can we start implementation?",
    timestamp: "2024-08-18T10:15:00Z",
    isOwn: true,
    isGroup: true,
    senderName: "You",
    senderId: "current-user",
    status: "sent",
  },
];
const sampleChat: ISelectedChat = {
  id: "team-group",
  name: "Team Group",
  photo: "https://example.com/group-photo.jpg",
  type: "group",
  isOnline: false,
  memberCount: 5,
};
const Chats = () => {
  const [messages, setMessages] = useState<IChatMessage[]>(sampleMessages);
  const [selectedChat, setSelectedChat] = useState<ISelectedChat>(sampleChat);

  const handleSendMessage = (messageData: {
    text: string;
    mentions: IMessageMention[];
    replyTo?: IMessageReply;
  }) => {
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

    // Simulate message status updates
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

  return (
    <div>
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
