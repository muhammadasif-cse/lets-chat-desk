import React, { useCallback, useEffect, useRef, useState } from "react";

import { useDispatch } from "react-redux";
import { useInfiniteScroll } from "../../../../hooks/use-infinite-scroll";
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
  const isLoadingRef = useRef<boolean>(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (selectedChat?.id && messages.length > 0 && currentCallCount === 0) {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    } else {
      const container = messagesContainerRef.current;
      if (container) {
        const currentScrollTop = container.scrollTop;
        container.scrollTo({
          top: currentScrollTop,
          behavior: "auto",
        });
      }
    }
  };

  const handleLoadPrevious = useCallback(() => {
    if (isLoadingRef.current || !hasMorePrevious || isLoadingPrevious) {
      return;
    }
    const prevCallCount = currentCallCount + 1;
    if (!loadedCallCounts.includes(prevCallCount)) {
      console.log("Loading previous messages at callCount:", prevCallCount);

      isLoadingRef.current = true;
      setIsLoadingPrevious(true);

      dispatch(setCurrentCallCount(prevCallCount));
      onLoadPreviousMessages?.(prevCallCount).finally(() => {
        isLoadingRef.current = false;
        setIsLoadingPrevious(false);
      });
    }
  }, [
    currentCallCount,
    hasMorePrevious,
    loadedCallCounts,
    onLoadPreviousMessages,
  ]);

  const handleLoadNext = useCallback(() => {
    if (isLoadingRef.current || !hasMoreNext) return;

    const nextCallCount = currentCallCount - 1;
    if (nextCallCount >= 0 && !loadedCallCounts.includes(nextCallCount)) {
      setIsLoadingNext(true);
      onLoadNextMessages?.(nextCallCount).finally(() => {
        setIsLoadingNext(false);
      });
    }
  }, [currentCallCount, hasMoreNext, loadedCallCounts, onLoadNextMessages]);

  const topInfiniteScrollRef = useInfiniteScroll({
    onLoadMore: handleLoadPrevious,
    isLoading: isLoadingPrevious,
    hasMore: hasMorePrevious && !isLoadingPrevious,
    threshold: 0.95,
  });

  const bottomInfiniteScrollRef = useInfiniteScroll({
    onLoadMore: handleLoadNext,
    isLoading: isLoadingNext,
    hasMore: hasMoreNext && !isLoadingNext,
    threshold: 0.1,
  });

  const setMessagesContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (messagesContainerRef.current !== node) {
      (messagesContainerRef as any).current = node;
    }
  }, []);

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

  useEffect(() => {
    handleScroll();
  }, [selectedChat?.id]);

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
          ref={setMessagesContainerRef}
          className="h-full overflow-y-auto px-4 py-4 chat-scrollbar"
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
              <div ref={topInfiniteScrollRef} className="h-1" />

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
                  data-message-id={message.messageId}
                />
              ))}

              {isLoadingNext && (
                <div className="flex justify-center py-4">
                  <Loading />
                </div>
              )}

              <div ref={bottomInfiniteScrollRef} className="h-1" />
            </>
          )}
        </div>
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
