import React, { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

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
import { processAttachments } from "../utils/process-attachments";
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
  onTyping,
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

  const previousMessagesLength = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);
  const shouldAutoScroll = useRef<boolean>(true);
  const scrollTimeout = useRef<number>();
  const scrollPositionBeforeLoad = useRef<number>(0);
  const scrollHeightBeforeLoad = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    isScrolling.current = true;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = window.setTimeout(() => {
      isScrolling.current = false;

      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      shouldAutoScroll.current = isAtBottom;
    }, 300);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (
      !messagesContainerRef.current ||
      !shouldAutoScroll.current ||
      isScrolling.current
    )
      return;

    const container = messagesContainerRef.current;
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  const handleLoadPrevious = useCallback(async () => {
    if (isLoadingRef.current || !hasMorePrevious || isLoadingPrevious) {
      return;
    }

    const prevCallCount = currentCallCount + 1;
    if (!loadedCallCounts.includes(prevCallCount)) {
      console.log("Loading previous messages at callCount:", prevCallCount);

      const container = messagesContainerRef.current;
      if (container) {
        scrollPositionBeforeLoad.current = container.scrollTop;
        scrollHeightBeforeLoad.current = container.scrollHeight;
      }

      isLoadingRef.current = true;
      setIsLoadingPrevious(true);
      shouldAutoScroll.current = false;

      dispatch(setCurrentCallCount(prevCallCount));

      try {
        await onLoadPreviousMessages?.(prevCallCount);
        setTimeout(() => {
          if (container && scrollHeightBeforeLoad.current > 0) {
            const newScrollHeight = container.scrollHeight;
            const heightAdded =
              newScrollHeight - scrollHeightBeforeLoad.current;
            container.scrollTop =
              scrollPositionBeforeLoad.current + heightAdded;
          }
        }, 0);
      } finally {
        isLoadingRef.current = false;
        setIsLoadingPrevious(false);
      }
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
    threshold: 0.1,
  });

  const bottomInfiniteScrollRef = useInfiniteScroll({
    onLoadMore: handleLoadNext,
    isLoading: isLoadingNext,
    hasMore: hasMoreNext && !isLoadingNext,
    threshold: 0.1,
  });

  const setMessagesContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (messagesContainerRef.current !== node) {
        (messagesContainerRef as any).current = node;

        if (node) {
          node.addEventListener("scroll", handleScroll);
        }
      }
    },
    [handleScroll]
  );

  const handleSendMessage = (messageData: ISendMessageData) => {
    if (!selectedChat) {
      console.error("No selected chat found");
      return;
    }

    const tempId = uuidv4();
    const isGroup = selectedChat.type === "group";

    const reqBody = {
      messageId: tempId,
      userId: isGroup ? null : parseInt(currentUserId || "0"),
      toUserId: isGroup ? null : parseInt(selectedChat.id),
      groupId: isGroup ? selectedChat.id : null,
      message: messageData.text,
      text: messageData.text,
      type: selectedChat.type,
      files: messageData.attachments || [],
      attachments: messageData.attachments || [],
      isApprovalNeeded: Boolean(messageData?.isApprovalNeeded),
      eligibleUsers: (selectedChat as any)?.eligibleUsers || [],
      parentMessageId: replyTo?.messageId || null,
      parentMessageText: replyTo?.text || null,
    };

    console.log("🚀 ~ ChatContainer ~ sending message:", reqBody);

    if (onSendMessage) {
      onSendMessage(reqBody as any);
    }
    setReplyTo(null);
    shouldAutoScroll.current = true;
  };

  const handleReplyToMessage = (message: IMessage) => {
    // Helper function to get sender name (same logic as in render)
    const getSenderName = (userId: number, fallbackName?: string) => {
      if (userId.toString() === currentUserId) {
        return "You";
      }
      const user = users.find(u => u.id === userId.toString());
      return user?.name || fallbackName || selectedChat?.name || "User";
    };

    setReplyTo({
      messageId: message.messageId,
      text: message.message,
      senderName: getSenderName(message.userId, message.senderName),
    });
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  useEffect(() => {
    if (selectedChat?.id && messages.length > 0) {
      shouldAutoScroll.current = true;
      scrollToBottom("auto");
      previousMessagesLength.current = messages.length;
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    const isNewMessage = messages.length > previousMessagesLength.current;

    if (isNewMessage && shouldAutoScroll.current) {
      scrollToBottom();
    }

    previousMessagesLength.current = messages.length;
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

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
              <div ref={topInfiniteScrollRef} className="h-1" />

              {isLoadingPrevious && (
                <div className="flex justify-center py-4">
                  <Loading />
                </div>
              )}

              {messages.map((message) => {
                const processedAttachments = processAttachments(
                  message.attachments || []
                );
                const parentMessage = message.parentMessageId
                  ? messages.find(
                      (m) => m.messageId === message.parentMessageId
                    )
                  : null;

                const parentAttachments = parentMessage
                  ? processAttachments(parentMessage.attachments || [])
                  : [];

                // Helper function to get sender name from userId
                const getSenderName = (userId: number, fallbackName?: string) => {
                  if (userId.toString() === currentUserId) {
                    return "You";
                  }
                  // Map userId to user info if available
                  const user = users.find(u => u.id === userId.toString());
                  return user?.name || fallbackName || selectedChat.name || "User";
                };

                return (
                  <Message
                    key={message.messageId}
                    id={message.messageId}
                    text={message.message}
                    timestamp={message.date}
                    isOwn={message.userId.toString() === currentUserId}
                    isGroup={selectedChat.type === "group"}
                    senderName={getSenderName(message.userId, message.senderName)}
                    senderPhoto={selectedChat.photo}
                    status={message.status}
                    attachment={processedAttachments[0]}
                    attachments={processedAttachments}
                    replyTo={
                      message.parentMessageId && parentMessage
                        ? {
                            messageId: message.parentMessageId,
                            text:
                              message.parentMessageText ||
                              parentMessage.message ||
                              "",
                            senderName: getSenderName(parentMessage.userId, parentMessage.senderName),
                            attachments: parentAttachments,
                          }
                        : undefined
                    }
                    onReply={() => handleReplyToMessage(message)}
                    data-message-id={message.messageId}
                  />
                );
              })}

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
          onTyping={onTyping}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
