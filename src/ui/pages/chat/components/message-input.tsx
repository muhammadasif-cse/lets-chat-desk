import { FileIcon, SendIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/button";

import { IMessageInputProps } from "../../../../interfaces/chat";
import inputReplyRender from "../helpers/input-reply-render";
import InputEmoji from "./input-emoji";
import InputFileOption from "./input-file-option";
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
  const [mentions, setMentions] = useState<
    Array<{
      id: string;
      name: string;
      start: number;
      length: number;
    }>
  >([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mentionTimeoutRef = useRef<number>();

  const hasContent = message.trim().length > 0 || selectedFiles.length > 0;

  // Generate preview URLs for images when files change
  useEffect(() => {
    const newPreviewUrls: string[] = [];
    
    selectedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newPreviewUrls.push(url);
      } else {
        newPreviewUrls.push('');
      }
    });
    
    setFilePreviewUrls(newPreviewUrls);
    
    // Cleanup old URLs
    return () => {
      newPreviewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [selectedFiles]);

  useEffect(() => {
    if (message === "" && textareaRef.current) {
      textareaRef.current.style.height = "24px";
    }
  }, [message]);

  useEffect(() => {
    if (!onTyping) return;
    if (mentionTimeoutRef.current) {
      clearTimeout(mentionTimeoutRef.current);
    }

    if (message.trim().length > 0) {
      onTyping(true);
      mentionTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 3000);
    } else {
      onTyping(false);
    }

    return () => {
      if (mentionTimeoutRef.current) {
        clearTimeout(mentionTimeoutRef.current);
      }
    };
  }, [message, onTyping]);

  useEffect(() => {
    return () => {
      if (onTyping && message.trim().length > 0) {
        onTyping(false);
      }
      
      if (mentionTimeoutRef.current) {
        clearTimeout(mentionTimeoutRef.current);
      }
      
      filePreviewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []); 

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
    if (message.trim() || selectedFiles.length > 0) {
      if (onTyping) {
        onTyping(false);
      }
      
      onSendMessage({
        text: message.trim(),
        replyTo: replyTo || undefined,
        attachments: selectedFiles.length > 0 ? selectedFiles : undefined,
      });
      setMessage("");
      setMentions([]);
      
      filePreviewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      setSelectedFiles([]);
      setFilePreviewUrls([]);
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

  const handleAttachment = (fileType?: string) => {
    if (fileInputRef.current) {
      if (fileType === "media") {
        fileInputRef.current.accept = "image/*,video/*";
      } else if (fileType === "document") {
        fileInputRef.current.accept =
          ".pdf,.doc,.docx,.txt,.zip,.rar,.xlsx,.pptx";
      } else {
        fileInputRef.current.accept =
          "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.xlsx,.pptx";
      }
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...fileArray]);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    if (filePreviewUrls[index]) {
      URL.revokeObjectURL(filePreviewUrls[index]);
    }
    
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="relative">
      {replyTo && inputReplyRender({ replyTo, onCancelReply })}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {/* File preview area */}
      {selectedFiles.length > 0 && (
        <div className="px-4 pb-2">
          <div className="bg-dark3/50 border border-dark2 rounded-lg p-3 mb-2">
            <div className="text-xs text-gray mb-2">
              Attachments ({selectedFiles.length})
            </div>
            
            {/* Image previews in a grid */}
            {selectedFiles.some(file => file.type.startsWith('image/')) && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {selectedFiles.map((file, index) => (
                  file.type.startsWith('image/') && filePreviewUrls[index] ? (
                    <div key={index} className="relative group">
                      <img
                        src={filePreviewUrls[index]}
                        alt={file.name}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                        {file.name}
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            )}
            
            {/* Non-image files list */}
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                !file.type.startsWith('image/') ? (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-dark2 rounded-lg p-2"
                  >
                    <FileIcon className="w-4 h-4 text-green2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-2">
        <div className="relative flex items-end bg-dark3/90 backdrop-blur-sm border border-dark2 rounded-3xl transition-all focus-within:border-green focus-within:ring-1 focus-within:ring-green/50 shadow-sm min-h-[48px]">
          <div className="flex items-end p-1">
            <InputFileOption handleAttachment={handleAttachment} />
          </div>

          <div className="flex-1 py-3 relative">
            <MentionInputComponent
              value={message}
              onChange={handleMentionInputChange}
              onSubmit={handleSend}
              placeholder={placeholder}
              users={users.map((user) => ({
                ...user,
                type: user.type || "user",
              }))}
              disabled={false}
            />
          </div>

          <div className="flex items-end p-1 gap-1">
            <InputEmoji setMessage={setMessage} />
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
