import React, { useEffect, useRef, useState } from "react";
import {
  IChatContainerProps,
  IChatMessage,
} from "../../../interfaces/chat.interface";
import Header from "./header";
import Message from "./message";
import MessageInput from "./message-input";

const ChatContainer: React.FC<IChatContainerProps> = ({
  selectedChat,
  messages = [],
  users = [],
  currentUserId,
  onSendMessage,
  onBack,
  onCall,
  onVideoCall,
  onSearch,
  onInfo,
}) => {
  const [replyTo, setReplyTo] = useState<{
    id: string;
    text: string;
    senderName: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (messageData: {
    text: string;
    mentions: Array<{
      id: string;
      name: string;
      start: number;
      length: number;
    }>;
    replyTo?: {
      id: string;
      text: string;
      senderName: string;
    };
  }) => {
    if (onSendMessage) {
      onSendMessage(messageData);
    }
    setReplyTo(null);
  };

  const handleMessageLongPress = (message: IChatMessage) => {
    if (message.text) {
      setReplyTo({
        id: message.id,
        text: message.text,
        senderName: message.senderName || "You",
      });
    }
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 bg-[#0B141A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-64 h-64 bg-[#2A3942] rounded-full flex items-center justify-center mb-8 mx-auto">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              className="text-[#8696A0]"
            >
              <path
                d="M60 0C26.863 0 0 26.863 0 60s26.863 60 60 60 60-26.863 60-60S93.137 0 60 0zm0 108c-26.51 0-48-21.49-48-48S33.49 12 60 12s48 21.49 48 48-21.49 48-48 48z"
                fill="currentColor"
              />
              <path
                d="M60 24c-19.882 0-36 16.118-36 36s16.118 36 36 36 36-16.118 36-36-16.118-36-36-36zm0 60c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-[#E9EDEF] text-2xl font-light mb-4">
            WhatsApp Web
          </h2>
          <p className="text-[#8696A0] text-sm max-w-md mx-auto leading-6">
            Send and receive messages without keeping your phone online.
            <br />
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0B141A] overflow-hidden">
      {/* Header */}
      <Header
        selectedChat={selectedChat}
        onBack={onBack}
        onCall={onCall}
        onVideoCall={onVideoCall}
        onSearch={onSearch}
        onInfo={onInfo}
      />

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 bg-[#0B141A]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#8696A0] text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleMessageLongPress(message);
                }}
                onClick={() => handleMessageLongPress(message)}
              >
                <Message
                  id={message.id}
                  text={message.text}
                  timestamp={message.timestamp}
                  isOwn={message.senderId === currentUserId}
                  isGroup={selectedChat.type === "group"}
                  senderName={message.senderName}
                  senderPhoto={message.senderPhoto}
                  status={message.status}
                  attachment={message.attachment}
                  mentions={message.mentions}
                  replyTo={message.replyTo}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        users={users}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        placeholder={`Message ${selectedChat.name}`}
      />
    </div>
  );
};

export default ChatContainer;
