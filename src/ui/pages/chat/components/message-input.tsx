import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import {
  FileIcon,
  MonitorIcon,
  PlusIcon,
  SendIcon,
  Smile,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { IChatUser } from "../../../interfaces/chat.interface";
import { IMessageInputProps } from "../../../interfaces/message.interface";
import MentionInputComponent from "./mention-input";

const MessageInput: React.FC<IMessageInputProps> = ({
  onSendMessage,
  onTyping,
  users = [],
  replyTo,
  onCancelReply,
  placeholder = "Type a message",
  isGroup = false,
}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentions, setMentions] = useState<
    Array<{
      id: string;
      name: string;
      start: number;
      length: number;
    }>
  >([]);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionTimeoutRef = useRef<number>();

  const hasContent = message.trim().length > 0;

  useEffect(() => {
    if (message === "" && textareaRef.current) {
      textareaRef.current.style.height = "24px";
    }
  }, [message]);

  useEffect(() => {
    if (onTyping) {
      onTyping(message.length > 0);
    }

    if (mentionTimeoutRef.current) {
      clearTimeout(mentionTimeoutRef.current);
    }

    mentionTimeoutRef.current = setTimeout(() => {
      if (onTyping) {
        onTyping(false);
      }
    }, 3000);

    return () => {
      if (mentionTimeoutRef.current) {
        clearTimeout(mentionTimeoutRef.current);
      }
    };
  }, [message, onTyping]);

  const handleMentionInputChange = useCallback(
    (
      value: string,
      extractedMentions: Array<{
        id: string;
        name: string;
        start: number;
        length: number;
      }>
    ) => {
      setMessage(value);
      setMentions(extractedMentions);
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!isGroup && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 128);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (hasContent) {
        handleSend();
      }
      return;
    }
  };

  const insertMention = (user: IChatUser) => {};

  const filteredUsers = users.filter((user) => user.type === "user");

  const renderMessageWithMentions = (text: string) => {
    if (!mentions.length) return text;

    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    mentions.forEach((mention, index) => {
      if (mention.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`} className="text-light">
            {text.slice(lastIndex, mention.start)}
          </span>
        );
      }
      elements.push(
        <span key={`input-mention-${index}`} className="text-blue font-medium">
          @{mention.name}
        </span>
      );

      lastIndex = mention.start + mention.length;
    });

    // add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end" className="text-light">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({
        text: message.trim(),
        mentions,
        replyTo: replyTo || undefined,
      });
      setMessage("");
      setMentions([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "24px";
          }
        }, 0);
      }

      if (onCancelReply) {
        onCancelReply();
      }
    }
  };

  const handleAttachment = () => {
    console.log("Handle attachment");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    console.log("Toggle recording:", !isRecording);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const handleEmojiClick = (emojiObject: any) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      {replyTo && (
        <div className="mb-3 bg-dark3/80 backdrop-blur-sm border-l-4 border-green pl-3 py-2 rounded flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-green text-sm font-medium mb-1">
              Replying to {replyTo.senderName}
            </div>
            <div className="text-gray text-sm truncate">{replyTo.text}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-dark3 text-gray hover:text-gray2 ml-2"
            onClick={onCancelReply}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="p-4">
        <div className="relative flex items-end bg-dark3/90 backdrop-blur-sm border border-dark2 rounded-3xl transition-all focus-within:border-green focus-within:ring-1 focus-within:ring-green/50 shadow-sm min-h-[48px]">
          <div className="flex items-end pb-1 pl-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-dark2 text-gray hover:text-green transition-colors rounded-full p-2 h-8 w-8 flex items-center justify-center"
                  type="button"
                >
                  <PlusIcon className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="bg-dark2 w-auto border border-dark3 p-2"
                align="start"
                side="top"
                sideOffset={10}
              >
                <div className="space-y-1">
                  <button
                    className="w-full flex items-center gap-3 p-2 text-gray hover:text-white hover:bg-dark rounded transition-colors whitespace-nowrap"
                    onClick={handleAttachment}
                  >
                    <FileIcon className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium">Document</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 p-2 text-gray hover:text-white hover:bg-dark rounded transition-colors whitespace-nowrap"
                    onClick={handleAttachment}
                  >
                    <MonitorIcon className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium">Photos & Videos</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1 py-3 relative">
            <MentionInputComponent
              value={message}
              onChange={handleMentionInputChange}
              onSubmit={handleSend}
              placeholder={placeholder}
              users={users}
              disabled={false}
            />
          </div>

          <div className="flex items-end pb-1 pr-3 gap-1">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-dark2 text-gray hover:text-green transition-colors rounded-full p-2 h-8 w-8 flex items-center justify-center"
                  type="button"
                >
                  <Smile className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-none bg-transparent shadow-none"
                align="end"
                side="top"
                sideOffset={10}
                avoidCollisions={true}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={Theme.DARK}
                  height={400}
                  width={350}
                  previewConfig={{
                    defaultEmoji: "1f60a",
                    defaultCaption: "Choose an emoji",
                    showPreview: true,
                  }}
                  searchDisabled={false}
                  autoFocusSearch={false}
                  lazyLoadEmojis={false}
                  emojiStyle={EmojiStyle.NATIVE}
                />
              </PopoverContent>
            </Popover>

            {hasContent && (
              <Button
                onClick={handleSend}
                className="bg-green hover:bg-green/90 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center transition-all ml-1"
                size="sm"
              >
                <SendIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
