import { EmojiPicker } from "@ferrucc-io/emoji-picker";
import {
    Camera,
    FileText,
    Image,
    MapPin,
    PaperclipIcon,
    Pause,
    Send,
    Trash2,
    User,
    Users as UsersIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { IChatUser } from "../interfaces/chat.interface";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface Mention {
  id: string;
  name: string;
  start: number;
  length: number;
}

interface ReplyTo {
  id: string;
  senderName: string;
  text: string;
}

interface MessageData {
  text: string;
  mentions: Mention[];
  replyTo?: ReplyTo;
}

interface InputAreaProps {
  onSendMessage?: (data: MessageData) => void;
  onSendVoice?: (blob: Blob, duration: number) => void;
  onSendFile?: (file: File) => void;
  onTyping?: (isTyping: boolean) => void;
  users?: IChatUser[];
  replyTo?: ReplyTo | null;
  onCancelReply?: () => void;
  placeholder?: string;
}

interface CaretCoordinates {
  top: number;
  left: number;
}

// Mock users for demonstration
const mockUsers: IChatUser[] = [
  { id: "1", name: "John Doe", username: "johndoe", type: "user" },
  { id: "2", name: "Jane Smith", username: "janesmith", type: "user" },
  { id: "3", name: "Team Alpha", username: "teamalpha", type: "group" },
];

// Utility function to get caret coordinates
const getCaretCoordinates = (
  element: HTMLTextAreaElement
): CaretCoordinates => {
  const div = document.createElement("div");
  const style = getComputedStyle(element);

  // Copy the textarea's style to the div
  Array.from(style).forEach((prop) => {
    div.style.setProperty(prop, style.getPropertyValue(prop));
  });

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";

  document.body.appendChild(div);

  const text = element.value.substring(0, element.selectionStart);
  div.textContent = text;

  const span = document.createElement("span");
  span.textContent = element.value.substring(element.selectionStart) || ".";
  div.appendChild(span);

  const coordinates = {
    top: span.offsetTop + parseInt(style.borderTopWidth),
    left: span.offsetLeft + parseInt(style.borderLeftWidth),
  };

  document.body.removeChild(div);
  return coordinates;
};

const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  onSendVoice,
  onSendFile,
  onTyping,
  users = mockUsers,
  replyTo,
  onCancelReply,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [isEmoji, setIsEmoji] = useState<boolean>(false);
  // Mention system states
  const [showMentions, setShowMentions] = useState<boolean>(false);
  const [mentionQuery, setMentionQuery] = useState<string>("");
  const [mentionPosition, setMentionPosition] = useState<number>(0);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mentionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  // Typing indicator with timeout
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

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Handle input changes with mention detection
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

      // Calculate dropdown position
      if (textareaRef.current) {
        const coordinates = getCaretCoordinates(textareaRef.current);
        setDropdownPosition({
          top: coordinates.top - 200, // Position above the cursor
          left: coordinates.left,
        });
      }
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  // Insert mention into text
  const insertMention = (user: IChatUser) => {
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

  // Filter users based on mention query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Send text message
  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage?.({
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

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (showMentions && filteredUsers.length > 0) {
        insertMention(filteredUsers[0]);
      } else {
        handleSendMessage();
      }
    } else if (e.key === "Escape") {
      setShowMentions(false);
    }
  };

  // Handle dropdown interaction events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBlur = () => {
    setTimeout(() => setShowMentions(false), 200);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordingBlob(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = () => {
    if (recordingBlob) {
      onSendVoice?.(recordingBlob, recordingTime);
      setRecordingBlob(null);
      setRecordingTime(0);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
    setRecordingBlob(null);
    setRecordingTime(0);
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile?.(file);
    }
    setShowAttachMenu(false);
  };

  // Format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Text formatting functions
  const formatText = (
    type: "bold" | "italic" | "strikethrough" | "monospace"
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);

    if (selectedText) {
      let formattedText = selectedText;
      switch (type) {
        case "bold":
          formattedText = `*${selectedText}*`;
          break;
        case "italic":
          formattedText = `_${selectedText}_`;
          break;
        case "strikethrough":
          formattedText = `~${selectedText}~`;
          break;
        case "monospace":
          formattedText = `\`\`\`${selectedText}\`\`\``;
          break;
      }

      const newMessage =
        message.substring(0, start) + formattedText + message.substring(end);
      setMessage(newMessage);

      // Restore focus and cursor position
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(
            start + formattedText.length,
            start + formattedText.length
          );
        }
      }, 0);
    }
  };

  return (
    <div>
      {(isRecording || recordingBlob) && (
        <div className="px-4 py-3 bg-dark3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-danger rounded-full animate-pulse"></div>
              <span className="text-light font-medium">
                {isRecording ? "Recording..." : "Recording Complete"}
              </span>
              <span className="text-gray text-sm">
                {formatTime(recordingTime)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {recordingBlob && (
                <button
                  onClick={sendVoiceMessage}
                  className="p-2 bg-green hover:bg-green/90 rounded-full transition-colors"
                >
                  <Send className="size-4 text-light" />
                </button>
              )}

              <button
                onClick={isRecording ? stopRecording : cancelRecording}
                className="p-2 bg-danger hover:bg-danger/90 rounded-full transition-colors"
              >
                {isRecording ? (
                  <Pause className="size-4 text-light" />
                ) : (
                  <Trash2 className="size-4 text-light" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 relative">
        {showMentions && filteredUsers.length > 0 && (
          <div
            style={{
              scrollbarColor: "#2a3942 #111B21",
              scrollbarWidth: "thin",
            }}
            ref={dropdownRef}
            className="absolute bottom-20 w-full left-4 right-4 bg-dark3 rounded-lg border border-gray max-h-48 overflow-y-auto z-50 shadow-xl"
            onMouseDown={handleMouseDown}
          >
            {filteredUsers.slice(0, 5).map((user) => (
              <button
                key={user.id}
                className="w-full flex items-center space-x-3 p-3 hover:bg-dark/30 transition-colors text-left"
                onClick={() => insertMention(user)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray flex items-center justify-center">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray flex items-center justify-center">
                      {user.type === "group" ? (
                        <UsersIcon className="size-4 text-dark" />
                      ) : (
                        <User className="size-4 text-dark" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-light text-sm font-medium truncate">
                    {user.name}
                  </div>
                  <div className="text-gray text-xs truncate">
                    @{user.username}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-dark4 text-gray hover:text-dark"
              >
                <PaperclipIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-dark4 border-dark4 text-light min-w-[180px]"
            >
              <DropdownMenuItem
                onClick={() => imageInputRef.current?.click()}
                className="hover:bg-dark4 cursor-pointer"
              >
                <div className="p-2 bg-purple-500 rounded-full">
                  <Image className="size-4 text-light" />
                </div>
                <span>Photos & Videos</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => fileInputRef.current?.click()}
                className="hover:bg-dark4 cursor-pointer"
              >
                <div className="p-2 bg-blue2 rounded-full">
                  <FileText className="size-4 text-light" />
                </div>
                <span>Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-dark4 cursor-pointer">
                <div className="p-2 bg-pink-500 rounded-full">
                  <Camera className="size-4 text-light" />
                </div>
                <span>Camera</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-dark4 cursor-pointer">
                <div className="p-2 bg-green2/70 rounded-full">
                  <MapPin className="size-4 text-light" />
                </div>
                <span>Location</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-dark4 cursor-pointer">
                <div className="p-2 bg-blue2 rounded-full">
                  <User className="size-4 text-light" />
                </div>
                <span>Contact</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* text input area */}
          <div className="flex-1 relative">
            {message && (
              <div className="absolute -top-10 left-0 bg-dark3 rounded px-2 py-1 flex items-center space-x-2 border border-dark3/70">
                <button
                  onClick={() => formatText("bold")}
                  className="text-xs font-bold text-gray hover:text-dark px-2 py-1 rounded hover:bg-gray"
                  title="Bold (*text*)"
                >
                  B
                </button>
                <button
                  onClick={() => formatText("italic")}
                  className="text-xs italic text-gray hover:text-dark px-2 py-1 rounded hover:bg-gray"
                  title="Italic (_text_)"
                >
                  I
                </button>
                <button
                  onClick={() => formatText("strikethrough")}
                  className="text-xs line-through text-gray hover:text-dark px-2 py-1 rounded hover:bg-gray"
                  title="Strikethrough (~text~)"
                >
                  S
                </button>
                <button
                  onClick={() => formatText("monospace")}
                  className="text-xs font-mono text-gray hover:text-dark px-2 py-1 rounded hover:bg-gray"
                  title="Monospace (```text```)"
                >
                  M
                </button>
              </div>
            )}
            <main className="flex h-full min-h-screen w-full items-center justify-center p-4">
              <Popover onOpenChange={setIsEmoji} open={isEmoji}>
                <PopoverTrigger asChild>
                  <Button>Open emoji picker</Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                  <EmojiPicker
                    className="font-['Lato'] w-[300px] border-none"
                    emojisPerRow={9}
                    emojiSize={36}
                  >
                    <EmojiPicker.Header>
                      <EmojiPicker.Input
                        placeholder="Search all emoji"
                        className="h-[36px] bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 w-full rounded-[8px] text-[15px] focus:shadow-[0_0_0_1px_#1d9bd1,0_0_0_6px_rgba(29,155,209,0.3)] dark:focus:shadow-[0_0_0_1px_#1d9bd1,0_0_0_6px_rgba(29,155,209,0.3)] focus:border-transparent focus:outline-none mb-1"
                        hideIcon
                      />
                    </EmojiPicker.Header>
                    <EmojiPicker.Group>
                      <EmojiPicker.List containerHeight={320} />
                    </EmojiPicker.Group>
                    <EmojiPicker.Preview>
                      {({ previewedEmoji }) => (
                        <>
                          {previewedEmoji ? (
                            <EmojiPicker.Content />
                          ) : (
                            <button>Add Emoji</button>
                          )}
                          <EmojiPicker.SkinTone />
                        </>
                      )}
                    </EmojiPicker.Preview>
                  </EmojiPicker>
                </PopoverContent>
              </Popover>
            </main>

            {/* <InputArea /> */}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileUpload}
        className="hidden"
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      {(showEmojiPicker || showAttachMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowEmojiPicker(false);
            setShowAttachMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default InputArea;
