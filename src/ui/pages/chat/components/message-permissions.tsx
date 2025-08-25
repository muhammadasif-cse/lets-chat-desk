import { useAppSelector } from "@/redux/selector";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { Button } from "../../../../ui/components/ui/button";

interface MessagePermissionsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  selectedUserId: number | null;
  onPermissionChange: (id: number) => void;
  selectedMessage: { messageId: string; type: string };
  receiveApprovedRequest: (messageId: string, type: string, approverId?: number | null) => void;
}

const MessagePermissions: React.FC<MessagePermissionsProps> = ({
  isOpen,
  onOpenChange,
  data,
  selectedUserId,
  onPermissionChange,
  selectedMessage,
  receiveApprovedRequest,
}) => {
  const { user } = useAppSelector((state) => state.auth);

  const handleSend = () => {
    receiveApprovedRequest(
      selectedMessage?.messageId,
      selectedMessage?.type,
      selectedUserId,
    );
    onOpenChange(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50">
      <div className="h-full w-full min-w-[340px] max-w-[500px] bg-[#202d33] text-white animate-in slide-in-from-right">
        <div className="flex items-center gap-3 p-4 border-b border-[#3c454c]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="hover:bg-[#3c454c] text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-lg font-semibold text-white">Request for permission</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            {data.map((item: any) => (
              <div
                key={item.id}
                className={`flex items-center space-x-3 rounded-lg border border-[#3c454c] bg-[#2a3942] p-3 cursor-pointer transition-colors ${
                  String(item.id) === String(user?.userId) 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:bg-[#3c454c]"
                } ${
                  selectedUserId === item.id ? "border-green-500 bg-green-500/10" : ""
                }`}
                onClick={() => {
                  if (String(item.id) !== String(user?.userId)) {
                    onPermissionChange(item.id);
                  }
                }}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedUserId === item.id
                      ? "border-green-500 bg-green-500"
                      : "border-[#3c454c]"
                  }`}
                >
                  {selectedUserId === item.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="flex-1 text-white">{item.name}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSend}
            disabled={selectedUserId === null}
            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagePermissions;
