import { CheckCheck, Check, Mic } from "lucide-react";
import { IRecentChatUsers } from "../../../../interfaces/user";
import { formatMessageTime } from "../utils/time-formatting";
import { useMemo } from "react";
import MessagePreview from "./message-preview";
import { useChatItemState } from "../../../hooks/useChatItemState";

interface UsersProps {
  data: IRecentChatUsers;
  isLast?: boolean;
  onUserSelect?: (data: IRecentChatUsers) => void;
}

const Users = ({ data, isLast = false, onUserSelect }: UsersProps) => {
  const {
    searchQuery,
    setSearchQuery,
    filteredUsers,
    getMessagePreviewData,
    handleChatActions,
    setupDraftLogic,
  } = useChatItemState();

  //* get message preview data and transform it
  const rawMessageData = getMessagePreviewData(data);
  const messagePreviewData = useMemo(() => {
    if (rawMessageData.type === "typing") {
      return { text: "typing...", className: "text-green-500" };
    }
    if (rawMessageData.type === "group-typing") {
      return {
        text: `${rawMessageData.username} is typing...`,
        className: "text-green-500",
      };
    }
    if (rawMessageData.type === "draft") {
      return {
        text: rawMessageData.content,
        className: "text-emerald-500",
        emoji: "📝",
      };
    }
    //* for regular messages, we need to parse them
    const parsedMessage = rawMessageData.content;
    return { text: parsedMessage, className: "text-gray-400" };
  }, [rawMessageData]);

  const handleClick = () => {
    if (onUserSelect) {
      onUserSelect(data);
    }
  };
  const isGroup = data.type === "group";

  return (
    <div
      className="flex w-full items-center px-4 py-3 hover:bg-gray-800/30 cursor-pointer transition-colors duration-200"
      onClick={handleClick}
    >
      <div className="relative mr-3 flex-shrink-0">
        <img
          width={40}
          height={40}
          src={
            data.photo
              ? isGroup
                ? `${import.meta.env.VITE_API_ASSETS_URL}/groupimages/${
                    data.photo
                  }`
                : `${import.meta.env.VITE_API_ASSETS_URL}/photos/${data.photo}`
              : isGroup
              ? "../../../assets/group-icon.png"
              : "../../../assets/user-icon.png"
          }
          alt={data.name ?? "profile_picture"}
          className="size-full w-10 h-10 border border-gray-700 shrink-0 rounded-full object-cover"
        />
        {data.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-900"></div>
        )}
      </div>

      <div
        className={`flex h-full w-full justify-between ${
          !isLast ? "border-b border-gray-700/50 pb-3" : ""
        }`}
      >
        <div className="flex flex-col justify-center space-y-1 flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-medium text-base truncate">
              {data.name || data.groupName}
            </h3>
            {data.isAdmin && data.type === "group" && (
              <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <MessagePreview messageData={messagePreviewData} chat={data} />
          </div>
        </div>

        {/* time and unread message count */}
        <div className="flex flex-col items-end justify-center space-y-1 ml-2 flex-shrink-0">
          <span className="text-gray-500 text-xs">
            {formatMessageTime({
              showTime: false,
              dateString:
                typeof data?.lastMessageDate === "string"
                  ? data?.lastMessageDate
                  : "",
            })}
          </span>
          {(data.unreadCount ?? 0) > 0 && (
            <div className="bg-green-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center font-medium px-1.5">
              {(data.unreadCount ?? 0) > 99 ? "99+" : data.unreadCount ?? 0}
            </div>
          )}
          {data.isTyping && (
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="w-1 h-1 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1 h-1 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
