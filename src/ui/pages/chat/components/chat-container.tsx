import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import ScrollToBottom from "react-scroll-to-bottom";
import { Button } from "../../../components/ui/button";

import { useDispatch } from "react-redux";
import {
  IChatContainerProps,
  IMessage,
  IMessageReply,
  ISendMessageData,
} from "../../../../interfaces/chat";
import { setCurrentCallCount } from "../../../../redux/store/actions";
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
  const dispatch = useDispatch();
  const [replyTo, setReplyTo] = useState<IMessageReply | null>(null);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Simple refs for basic functionality
  const selectedChatIdRef = useRef<string | undefined>(selectedChat?.id);
  const isLoadingRef = useRef<boolean>(false);
  const hasUserScrolledRef = useRef<boolean>(false);

  const { ref: topRef, inView: topInView } = useInView({
    threshold: 0.1,
    rootMargin: "100px 0px 0px 0px",
    triggerOnce: false,
  });

  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0.1,
    rootMargin: "0px 0px 50px 0px",
    triggerOnce: false,
  });

  // Reset state on chat change
  useEffect(() => {
    if (selectedChatIdRef.current !== selectedChat?.id) {
      selectedChatIdRef.current = selectedChat?.id;
      setIsLoadingPrevious(false);
      setIsLoadingNext(false);
      setShowScrollButton(false);
      isLoadingRef.current = false;
      hasUserScrolledRef.current = false;
    }
  }, [selectedChat?.id]);

  // Load previous messages when scrolling to top
  useEffect(() => {
    if (!selectedChat?.id) return;

    const timeoutId = setTimeout(() => {
      if (
        topInView &&
        !isLoadingPrevious &&
        !isLoadingRef.current &&
        hasUserScrolledRef.current
      ) {
        const prevCallCount = currentCallCount + 1;
        if (hasMorePrevious && !loadedCallCounts.includes(prevCallCount)) {
          console.log("Loading previous messages at callCount:", prevCallCount);

          isLoadingRef.current = true;
          setIsLoadingPrevious(true);

          dispatch(setCurrentCallCount(prevCallCount));
          onLoadPreviousMessages?.(prevCallCount).finally(() => {
            setTimeout(() => {
              isLoadingRef.current = false;
              setIsLoadingPrevious(false);
            }, 100);
          });
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    topInView,
    isLoadingPrevious,
    selectedChat?.id,
    currentCallCount,
    hasMorePrevious,
    loadedCallCounts,
    dispatch,
    onLoadPreviousMessages,
  ]);

  // Load next messages when scrolling to bottom
  useEffect(() => {
    if (!selectedChat?.id || messages.length === 0) return;

    const timeoutId = setTimeout(() => {
      if (
        bottomInView &&
        !isLoadingNext &&
        hasMoreNext &&
        !isLoadingRef.current
      ) {
        const nextCallCount = currentCallCount - 1;
        if (nextCallCount >= 0 && !loadedCallCounts.includes(nextCallCount)) {
          setIsLoadingNext(true);
          onLoadNextMessages?.(nextCallCount).finally(() => {
            setIsLoadingNext(false);
          });
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    bottomInView,
    isLoadingNext,
    hasMoreNext,
    selectedChat?.id,
    messages.length,
    currentCallCount,
    loadedCallCounts,
    onLoadNextMessages,
  ]);

  // Track user scrolling away from bottom
  useEffect(() => {
    setShowScrollButton(!bottomInView && messages.length > 0);
    if (!bottomInView) {
      hasUserScrolledRef.current = true;
    }
  }, [bottomInView, messages.length]);

  const handleSendMessage = (messageData: ISendMessageData) => {
    if (onSendMessage) {
      onSendMessage(messageData);
    }
    setReplyTo(null);
    // react-scroll-to-bottom will automatically scroll on new message
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
    // This will be handled by react-scroll-to-bottom automatically
    setShowScrollButton(false);
    hasUserScrolledRef.current = false;
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

      <div className="flex-1 relative overflow-auto">
        <ScrollToBottom
          className="h-full"
          scrollViewClassName="px-4 py-4 chat-scrollbar"
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
            </>
          )}
        </ScrollToBottom>

        {showScrollButton && (
          <div className="absolute bottom-4 right-6 z-20">
            <Button
              onClick={scrollToBottom}
              className="cursor-pointer shrink-0 bg-dark3/90 hover:bg-dark3 text-gray hover:text-light rounded-full shadow-lg backdrop-blur-sm transition-all"
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
