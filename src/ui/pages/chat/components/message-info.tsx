import { IChatApiResponse } from "@/interfaces/chat";
import { ArrowLeft } from "lucide-react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useGetMessageInfoMutation } from "../../../../redux/store/mutations";
import { Button } from "../../../components/ui/button";
import MessageInfoSkeleton from "../helpers/message-info.skeleton";
import { renderUserList } from "../helpers/render-user-list";

interface IMessageInfoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMessage: { messageId: string; type: string };
}

const MessageInfo: React.FC<IMessageInfoProps> = ({
  isOpen,
  onOpenChange,
  selectedMessage,
}) => {
  const [messageInfo, setMessageInfo] = useState<any>(null);
  const [getMessageInfo, { isLoading }] = useGetMessageInfoMutation();

  const handleFetchMessageInfo = async (messageId: string, type: string) => {
    try {
      const response = await getMessageInfo({ messageId, type }).unwrap();
      const { code, result } = response as IChatApiResponse;
      if (code === 200) {
        setMessageInfo(result);
      } else {
        console.error("Failed to fetch message info");
      }
    } catch (error: any) {
      console.error("Error fetching message info:", error?.data?.message || error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (selectedMessage?.messageId && selectedMessage?.type) {
      handleFetchMessageInfo(selectedMessage.messageId, selectedMessage.type);
    }
  }, [selectedMessage]);

  

  const renderSection = (label: string, value: string | null) =>
    value ? (
      <div className="mb-4">
        <p className="mb-1 text-sm text-gray-400">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    ) : null;

  const renderSkeleton = () => (
    <MessageInfoSkeleton />
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50">
      <div className="h-full w-full min-w-[340px] max-w-[500px] bg-dark4 text-white animate-in slide-in-from-right">
        <div className="flex items-center gap-3 p-4 border-b border-gray">
          <Button
            size="icon"
            onClick={() => onOpenChange(false)}
            className="bg-gray text-dark size-6 hover:bg-gray/90"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-lg font-semibold text-white">Message Information</h2>
        </div>
        
        <div className="p-6 text-white overflow-y-auto h-[calc(100%-80px)]">
          {isLoading || !messageInfo ? (
            renderSkeleton()
          ) : (
            <>
              {renderSection(
                "Sent At",
                messageInfo.sentAt && moment(messageInfo.sentAt).format("DD MMM YYYY, h:mm:ss A"),
              )}

              {Array.isArray(messageInfo.seenList) &&
                renderUserList(messageInfo.seenList, "Seen by", true)}

              {Array.isArray(messageInfo.notSeenList) &&
                renderUserList(messageInfo.notSeenList, "Not Seen", false)}

              {renderSection("Approved By", messageInfo.approvedBy)}
              {renderSection(
                "Approved At",
                messageInfo.approvedAt &&
                  moment(messageInfo.approvedAt).format("DD MMM YYYY, h:mm:ss A"),
              )}
              {renderSection("Rejected By", messageInfo.rejectedBy)}
              {renderSection(
                "Rejected At",
                messageInfo.rejectedAt &&
                  moment(messageInfo.rejectedAt).format("DD MMM YYYY, h:mm:ss A"),
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInfo;
