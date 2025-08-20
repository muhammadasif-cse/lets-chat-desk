import { ChevronDown } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "../../../components/ui/button";
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

  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false); // Start with false to not show loading initially
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // Intersection observer for top of messages (load older messages)
  const { ref: topRef, inView: topInView } = useInView({
    threshold: 0,
    rootMargin: "100px 0px 0px 0px",
  });

  // Intersection observer for bottom of messages (auto scroll detection)
  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0,
    rootMargin: "0px 0px 50px 0px",
  });

  // Load older messages when scrolling to top
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMoreMessages || messages.length === 0) return;

    setIsLoadingOlder(true);

    // Store current scroll position
    const container = messagesContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
    }

    try {
      // Simulate API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add logic here to load older messages
      // For now, we'll simulate no more messages after a while
      if (messages.length > 50) {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Failed to load older messages:", error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, hasMoreMessages, messages.length]);

  // Initialize hasMoreMessages based on message count
  useEffect(() => {
    if (messages.length > 10) {
      setHasMoreMessages(true);
    }
  }, [messages.length]);

  // Trigger load when scrolling to top
  useEffect(() => {
    if (topInView && !isLoadingOlder && hasMoreMessages) {
      loadOlderMessages();
    }
  }, [topInView, loadOlderMessages, isLoadingOlder, hasMoreMessages]);

  // Maintain scroll position when loading older messages
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

  const handleReplyToMessage = (message: IChatMessage) => {
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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 bg-foreground flex items-center justify-center">
        <div className="text-center bg-foreground/90 backdrop-blur-sm rounded-lg p-8">
          <div className="w-64 h-64 bg-foreground rounded-full flex items-center justify-center mb-8 mx-auto">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              className="text-light"
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
          <h2 className="text-light text-2xl font-light mb-4">Let's Chat</h2>
          <p className="text-gray2 text-sm max-w-md mx-auto leading-6">
            Send and receive messages without keeping your phone online.
            <br />
            Use Let's Chat on up to 4 linked devices and 1 phone at the same
            time.
          </p>
        </div>
      </div>
    );
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
                    <div className="flex items-center space-x-2 bg-dark3/80 backdrop-blur-sm rounded-full px-4 py-2">
                      <div className="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <span className="text-gray text-sm">
                        Loading messages...
                      </span>
                    </div>
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
                  key={message.id}
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
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          placeholder={`Message ${selectedChat.name}`}
          isGroup={selectedChat.type === "group"}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
