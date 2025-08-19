import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import {
  FileIcon,
  MonitorIcon,
  PlusIcon,
  SendIcon,
  Smile
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { IMessageInputProps } from "../../../interfaces/message.interface";
import inputReplyRender from "../utils/input-reply-render";
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

  return (
    <div className="relative">
      {replyTo && inputReplyRender({ replyTo, onCancelReply })}

      <div className="px-4 pb-2">
        <div className="relative flex items-end bg-dark3/90 backdrop-blur-sm border border-dark2 rounded-3xl transition-all focus-within:border-green focus-within:ring-1 focus-within:ring-green/50 shadow-sm min-h-[48px]">
          <div className="flex items-end p-1">
            <Popover>
              <PopoverTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-dark p-2.5 text-gray hover:text-green transition-colors rounded-full size-6 flex items-center justify-center"
                  type="button"
                >
                  <PlusIcon className="size-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="bg-dark2 w-auto border border-dark3 px-3 py-1"
                align="start"
                side="top"
                sideOffset={10}
              >
                <div className="space-y-1">
                  <button
                    className="w-full p-2 -ml-2 flex items-center gap-3 text-gray hover:text-white hover:bg-dark rounded transition-colors whitespace-nowrap"
                    onClick={handleAttachment}
                  >
                    <FileIcon className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium">Document</span>
                  </button>
                  <button
                    className="w-full p-2 -ml-2 flex items-center gap-3 text-gray hover:text-white hover:bg-dark rounded transition-colors whitespace-nowrap"
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

          <div className="flex items-end p-1 gap-1">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-dark text-gray hover:text-green transition-colors rounded-full p-2.5 size-6 flex items-center justify-center"
                  type="button"
                >
                  <Smile className="size-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-none bg-transparent shadow-none"
                align="end"
                side="top"
              >
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setMessage((prev) => prev + emojiData.emoji);
                  }}
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
                size="sm"
                className="text-dark bg-green2 transition-colors rounded-full p-2.5 size-6 cursor-pointer"
                type="button"
                onClick={handleSend}
              >
                <SendIcon className="size-6" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
