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
  onLoadPreviousMessages,
  onLoadNextMessages,
  currentCallCount = 0,
  hasMorePrevious = false,
  hasMoreNext = false,
  loadedCallCounts = [],
}) => {
  const [replyTo, setReplyTo] = useState<IMessageReply | null>(null);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const isLoadingRef = useRef<boolean>(false);
  const selectedChatIdRef = useRef<string | undefined>(selectedChat?.id);
  const maintainScrollPositionRef = useRef<boolean>(false);

  const { ref: topRef, inView: topInView } = useInView({
    threshold: 0.1,
    rootMargin: "20px 0px 0px 0px",
    triggerOnce: false,
  });

  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0.1,
    rootMargin: "0px 0px 20px 0px",
    triggerOnce: false,
  });

  const loadPreviousMessages = useCallback(async () => {
    if (isLoadingRef.current || !onLoadPreviousMessages) return;

    const prevCallCount = currentCallCount + 1;
    console.log("loadPreviousMessages called:", {
      currentCallCount,
      prevCallCount,
      loadedCallCounts,
      hasMorePrevious,
    });

    if (loadedCallCounts.includes(prevCallCount)) {
      console.log(
        "Previous messages already loaded for callCount:",
        prevCallCount
      );
      return;
    }

    isLoadingRef.current = true;
    setIsLoadingPrevious(true);
    maintainScrollPositionRef.current = true; // Flag to maintain scroll position

    const container = messagesContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
      prevScrollTopRef.current = container.scrollTop;
    }

    try {
      console.log(
        "Calling onLoadPreviousMessages with callCount:",
        prevCallCount
      );
      const hasData = await onLoadPreviousMessages(prevCallCount);
      console.log("onLoadPreviousMessages result:", hasData);
    } catch (error) {
      console.error("Failed to load previous messages:", error);
    } finally {
      // Delay clearing loading state to ensure scroll position is maintained
      setTimeout(() => {
        setIsLoadingPrevious(false);
        isLoadingRef.current = false;
      }, 100);
    }
  }, [
    currentCallCount,
    onLoadPreviousMessages,
    loadedCallCounts,
  ]);

  const loadNextMessages = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreNext || !onLoadNextMessages) return;

    if (currentCallCount === 0) {
      console.log("At callCount 0, not loading next messages");
      return;
    }

    const nextCallCount = currentCallCount - 1; // Next messages have LOWER callCount
    if (loadedCallCounts.includes(nextCallCount)) return;

    isLoadingRef.current = true;
    setIsLoadingNext(true);
    maintainScrollPositionRef.current = true; // Flag to maintain scroll position

    const container = messagesContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
      prevScrollTopRef.current = container.scrollTop;
    }

    try {
      const hasData = await onLoadNextMessages(nextCallCount);
    } catch (error) {
      console.error("Failed to load next messages:", error);
    } finally {
      // Delay clearing loading state to ensure scroll position is maintained  
      setTimeout(() => {
        setIsLoadingNext(false);
        isLoadingRef.current = false;
      }, 100);
    }
  }, [
    currentCallCount,
    hasMoreNext,
    onLoadNextMessages,
    loadedCallCounts,
  ]);

  useEffect(() => {
    if (selectedChatIdRef.current !== selectedChat?.id) {
      selectedChatIdRef.current = selectedChat?.id;
      isLoadingRef.current = false;
      setIsLoadingPrevious(false);
      setIsLoadingNext(false);
      setIsAtBottom(true); // Reset for new chat
      setPreviousMessageCount(0); // Reset message count
      setIsInitialLoad(true); // Mark as initial load
      maintainScrollPositionRef.current = false; // Reset scroll position maintenance
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    if (!selectedChat?.id) return;

    const timeoutId = setTimeout(() => {
      console.log("Top scroll check:", {
        topInView,
        isLoadingPrevious,
        hasMorePrevious,
        isLoadingRef: isLoadingRef.current,
        currentCallCount,
        loadedCallCounts,
      });

      if (topInView && !isLoadingPrevious && !isLoadingRef.current) {
        // Check if we can load previous messages
        const prevCallCount = currentCallCount + 1; // Previous messages have HIGHER callCount
        if (!loadedCallCounts.includes(prevCallCount)) {
          console.log("Top in view - loading previous messages");
          loadPreviousMessages();
        } else {
          console.log("Cannot load previous messages:", {
            prevCallCount,
            alreadyLoaded: loadedCallCounts.includes(prevCallCount),
          });
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    topInView,
    loadPreviousMessages,
    isLoadingPrevious,
    selectedChat?.id,
    currentCallCount,
    loadedCallCounts,
  ]);

  useEffect(() => {
    if (!selectedChat?.id || messages.length === 0) return;

    const timeoutId = setTimeout(() => {
      if (
        bottomInView &&
        !isLoadingNext &&
        hasMoreNext &&
        !isLoadingRef.current
      ) {
        console.log("Bottom in view - loading next messages");
        loadNextMessages();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    bottomInView,
    loadNextMessages,
    isLoadingNext,
    hasMoreNext,
    selectedChat?.id,
    messages.length,
  ]);

  // Enhanced scroll position maintenance effect
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // If we're maintaining scroll position (after loading previous/next messages)
    if (maintainScrollPositionRef.current && prevScrollHeightRef.current > 0) {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;

      // For previous messages, maintain relative position
      if (isLoadingPrevious || (!isLoadingPrevious && scrollDiff > 0)) {
        const newScrollTop = prevScrollTopRef.current + scrollDiff;
        container.scrollTop = newScrollTop;
        console.log("Maintained scroll position:", {
          prevScrollHeight: prevScrollHeightRef.current,
          newScrollHeight,
          scrollDiff,
          prevScrollTop: prevScrollTopRef.current,
          newScrollTop
        });
      }
      // For next messages, maintain position
      else if (isLoadingNext || (!isLoadingNext && scrollDiff < 0)) {
        container.scrollTop = prevScrollTopRef.current;
      }

      // Reset refs
      prevScrollHeightRef.current = 0;
      prevScrollTopRef.current = 0;
      maintainScrollPositionRef.current = false;

      // Update message count to prevent auto-scroll
      setPreviousMessageCount(messages.length);
      return;
    }

    // Handle initial load and new messages
    const currentMessageCount = messages.length;

    // Handle initial load - auto-scroll to bottom
    if (isInitialLoad && currentMessageCount > 0) {
      setIsInitialLoad(false);
      setPreviousMessageCount(currentMessageCount);
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        console.log("Initial load - scrolled to bottom");
      }
      return;
    }

    // Only auto-scroll for genuine new messages when user is at bottom
    // and not during loading
    if (!isLoadingPrevious && !isLoadingNext) {
      const hasNewMessages = currentMessageCount > previousMessageCount;
      const shouldAutoScroll = isAtBottom && hasNewMessages;

      if (shouldAutoScroll && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        console.log("Auto-scrolled due to new messages while at bottom");
      }

      // Always update message count
      setPreviousMessageCount(currentMessageCount);
    }
  }, [
    messages,
    isAtBottom,
    isLoadingPrevious,
    isLoadingNext,
    previousMessageCount,
    isInitialLoad,
  ]);

  useEffect(() => {
    // Simple bottom detection - no complex logic
    setIsAtBottom(bottomInView);
  }, [bottomInView]);

  const handleSendMessage = (messageData: ISendMessageData) => {
    if (onSendMessage) {
      onSendMessage(messageData);
      // Always scroll to bottom when user sends a message
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      console.log("User sent message - scrolling to bottom");
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

  // Handle manual scroll events - improved
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Don't update scroll state during loading or position maintenance
    if (isLoadingPrevious || isLoadingNext || maintainScrollPositionRef.current) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottomNow = scrollHeight - scrollTop - clientHeight < 10;

    setIsAtBottom(isAtBottomNow);
  }, [isLoadingPrevious, isLoadingNext]);

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
          onScroll={handleScroll}
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
              <div ref={topRef} className="h-1" />

              {isLoadingPrevious && (
                <div className="flex justify-center py-4">
                  <Loading />
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

              {isLoadingNext && (
                <div className="flex justify-center py-4">
                  <Loading />
                </div>
              )}

              <div ref={bottomRef} className="h-1" />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {!isAtBottom && (
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