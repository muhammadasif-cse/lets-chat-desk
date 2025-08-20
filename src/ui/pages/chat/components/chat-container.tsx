import { ChevronDown } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "../../../components/ui/button";

import {
  IChatContainerProps,
  IMessage,
  IMessageReply,
  ISendMessageData,
} from "../../../../interfaces/chat";
import Loading from "../utils/loading";
import Header from "./header";
import Message from "./message";
import MessageInput from "./message-input";
import { WelcomeScreen } from "./welcome-screen";

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
  const [replyTo, setReplyTo] = useState<IMessageReply | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  const { ref: topRef, inView: topInView } = useInView({
    threshold: 0,
    rootMargin: "100px 0px 0px 0px",
  });

  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0,
    rootMargin: "0px 0px 50px 0px",
  });

  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMoreMessages || messages.length === 0) return;

    setIsLoadingOlder(true);

    const container = messagesContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (messages.length > 50) {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Failed to load older messages:", error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, hasMoreMessages, messages.length]);

  useEffect(() => {
    if (messages.length > 10) {
      setHasMoreMessages(true);
    }
  }, [messages.length]);

  useEffect(() => {
    if (topInView && !isLoadingOlder && hasMoreMessages) {
      loadOlderMessages();
    }
  }, [topInView, loadOlderMessages, isLoadingOlder, hasMoreMessages]);

  useEffect(() => {
    if (isLoadingOlder) return;

    const container = messagesContainerRef.current;
    if (container && prevScrollHeightRef.current > 0) {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
      container.scrollTop = container.scrollTop + scrollDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [messages, isLoadingOlder]);

  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    setShouldScrollToBottom(bottomInView);
  }, [bottomInView]);

  const handleSendMessage = (messageData: ISendMessageData) => {
    if (onSendMessage) {
      onSendMessage(messageData);
    }
    setReplyTo(null);
  };

  const handleReplyToMessage = (message: IMessage) => {
    setReplyTo({
      messageId: message.messageId,
      text: message.message,
      senderName: message.senderName,
    });
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!selectedChat) {
    return <WelcomeScreen />;
  }

  return (
    <div className="h-full flex flex-col bg-dark overflow-hidden">
      <div className="flex-shrink-0 sticky top-0 z-30">
        <Header
          selectedChat={selectedChat}
          onBack={onBack}
          onCall={onCall}
          onVideoCall={onVideoCall}
          onSearch={onSearch}
          onInfo={onInfo}
        />
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div
          ref={messagesContainerRef}
          className="absolute inset-0 overflow-y-auto px-4 py-4 chat-scrollbar smooth-scroll"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-dark/80 backdrop-blur-sm rounded-lg p-6">
                <p className="text-light">
                  No messages yet. Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            <>
              {hasMoreMessages && (
                <div ref={topRef} className="flex justify-center py-4">
                  {isLoadingOlder ? (
                    <Loading />
                  ) : (
                    <div className="bg-dark3/80 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-gray text-sm">
                        Scroll up to load more
                      </span>
                    </div>
                  )}
                </div>
              )}

              {messages.map((message) => (
                <Message
                  key={message.messageId}
                  id={message.messageId}
                  text={message.message}
                  timestamp={message.date}
                  isOwn={message.userId.toString() === currentUserId}
                  isGroup={selectedChat.type === "group"}
                  senderName={message.senderName}
                  senderPhoto={selectedChat.photo}
                  status={message.status}
                  attachment={message.attachments?.[0]}
                  replyTo={
                    message.parentMessageId
                      ? {
                          messageId: message.parentMessageId,
                          text: message.parentMessageText || "",
                          senderName: "Unknown",
                        }
                      : undefined
                  }
                  onReply={() => handleReplyToMessage(message)}
                />
              ))}

              <div ref={bottomRef} className="h-1" />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {!shouldScrollToBottom && (
          <div className="absolute bottom-4 right-6 z-20 size-6">
            <Button
              onClick={scrollToBottom}
              className="cursor-pointer  shrink-0 bg-dark3/90 hover:bg-dark3 text-gray hover:text-light rounded-full shadow-lg backdrop-blur-sm transition-all"
              size="icon"
            >
              <ChevronDown className="size-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 sticky bottom-0 z-30">
        <MessageInput
          onSendMessage={handleSendMessage}
          users={users}
          replyTo={replyTo ?? undefined}
          onCancelReply={handleCancelReply}
          placeholder={`Message ${selectedChat.name}`}
          isGroup={selectedChat.type === "group"}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
