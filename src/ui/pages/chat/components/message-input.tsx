import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Smile,
  X,
  User,
  Users as UsersIcon,
} from "lucide-react";
import { Button } from "../../../components/ui/button";

interface User {
  id: string;
  name: string;
  photo?: string;
  type?: "user" | "group";
}

interface MessageInputProps {
  onSendMessage: (message: {
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
  }) => void;
  onTyping?: (isTyping: boolean) => void;
  users?: User[];
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  } | null;
  onCancelReply?: () => void;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  users = [],
  replyTo,
  onCancelReply,
  placeholder = "Type a message",
}) => {
  const [message, setMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
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

  // Handle typing indicator
  useEffect(() => {
    if (onTyping) {
      onTyping(message.length > 0);
    }

    // Clear typing after 3 seconds of inactivity
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;

    setMessage(value);

    // Check for @ mentions
    const textBeforeCursor = value.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(cursorPosition - mentionMatch[0].length);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  const insertMention = (user: User) => {
    const beforeMention = message.slice(0, mentionPosition);
    const afterMention = message.slice(
      mentionPosition + mentionQuery.length + 1
    );
    const mentionText = `@${user.name}`;

    const newMessage = beforeMention + mentionText + " " + afterMention;
    const mentionStart = mentionPosition;
    const mentionLength = mentionText.length;

    setMessage(newMessage);
    setMentions((prev) => [
      ...prev.filter((m) => m.start !== mentionStart),
      {
        id: user.id,
        name: user.name,
        start: mentionStart,
        length: mentionLength,
      },
    ]);

    setShowMentions(false);
    setMentionQuery("");

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          mentionStart + mentionLength + 1,
          mentionStart + mentionLength + 1
        );
      }
    }, 0);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
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
      if (onCancelReply) {
        onCancelReply();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachment = () => {
    // Handle file attachment
    console.log("Handle attachment");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Handle voice recording
    console.log("Toggle recording:", !isRecording);
  };

  return (
    <div className="bg-[#2A3942] border-t border-[#3B4A54] p-4">
      {/* Reply preview */}
      {replyTo && (
        <div className="mb-3 bg-[#202C33] border-l-4 border-[#00A884] pl-3 py-2 rounded flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-[#00A884] text-sm font-medium mb-1">
              Replying to {replyTo.senderName}
            </div>
            <div className="text-[#8696A0] text-sm truncate">
              {replyTo.text}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-[#3B4A54] text-[#8696A0] hover:text-[#E9EDEF] ml-2"
            onClick={onCancelReply}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Mention suggestions */}
      {showMentions && filteredUsers.length > 0 && (
        <div className="mb-3 bg-[#202C33] rounded-lg border border-[#3B4A54] max-h-48 overflow-y-auto">
          {filteredUsers.slice(0, 5).map((user) => (
            <button
              key={user.id}
              className="w-full flex items-center space-x-3 p-3 hover:bg-[#3B4A54] transition-colors text-left"
              onClick={() => insertMention(user)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#374151] flex items-center justify-center">
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#374151] flex items-center justify-center">
                    {user.type === "group" ? (
                      <UsersIcon className="w-4 h-4 text-[#8696A0]" />
                    ) : (
                      <User className="w-4 h-4 text-[#8696A0]" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#E9EDEF] text-sm font-medium truncate">
                  {user.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end space-x-2">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-[#3B4A54] text-[#8696A0] hover:text-[#E9EDEF] mb-1"
          onClick={handleAttachment}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="min-h-[44px] max-h-32 resize-none bg-[#2A3942] border border-[#3B4A54] text-[#E9EDEF] placeholder:text-[#8696A0] focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] pr-12 rounded-lg px-3 py-2 w-full outline-none"
            rows={1}
          />

          {/* Emoji button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 bottom-2 p-1 hover:bg-[#3B4A54] text-[#8696A0] hover:text-[#E9EDEF]"
          >
            <Smile className="w-5 h-5" />
          </Button>
        </div>

        {/* Send/Record button */}
        {message.trim() ? (
          <Button
            onClick={handleSend}
            className="p-2 bg-[#00A884] hover:bg-[#00A884]/90 text-white rounded-full mb-1"
          >
            <Send className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            onClick={toggleRecording}
            className={`p-2 rounded-full mb-1 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-[#00A884] hover:bg-[#00A884]/90 text-white"
            }`}
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
