import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { IMessage } from "../../../../interfaces/chat";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";

interface MessageEditProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editMessage?: IMessage;
  setModifyMessage: (messageId: string, newMessage: string, type: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
}

const MessageEdit: React.FC<MessageEditProps> = ({
  isOpen,
  onOpenChange,
  editMessage,
  setModifyMessage,
  onTyping,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editMessage) {
      setNewMessage(editMessage.message || "");
    }
  }, [editMessage]);

  const handleSave = async () => {
    if (!editMessage || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      await setModifyMessage(editMessage.messageId, newMessage.trim(), editMessage.type);
      onOpenChange(false);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to update message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewMessage(editMessage?.message || "");
    onOpenChange(false);
  };

  const handleTextChange = (value: string) => {
    setNewMessage(value);
    onTyping(true);
    
    setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-3xl bg-[#202d33] rounded-t-lg animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between p-4 border-b border-[#3c454c]">
          <h2 className="text-lg font-semibold text-white">Edit Message</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="hover:bg-[#3c454c] text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <Textarea
            value={newMessage}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[100px] bg-[#2a3942] border-[#3c454c] text-white placeholder:text-gray-400 resize-none focus:border-green-500"
            autoFocus
          />
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-[#3c454c] text-white hover:bg-[#3c454c]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !newMessage.trim() || newMessage === editMessage?.message}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageEdit;
