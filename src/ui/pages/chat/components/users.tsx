import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { formatTime } from "../utils/time-formatting";
import { Check2Icon } from "../../../assets/icons/check.icon";
import { IUsersProps } from "../../../types/user.type";
import { UserIcon, UsersIcon } from "../../../assets/icons/users.icon";

const Users = ({
  data,
  isLast = false,
  isSelected = false,
  onUserSelect,
}: IUsersProps) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onUserSelect) {
      onUserSelect(data);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isGroup = data.type === "group";
  const hasUnreadMessages = (data.unreadCount ?? 0) > 0;

  // message preview
  const messagePreview = useMemo(() => {
    if (data.isTyping) {
      return {
        text: "typing...",
        className: "text-green2 italic",
        isTyping: true,
      };
    }

    let message = data.message || data.lastMessage || "No messages yet";

    // handle different message types
    if (message === "Attachment(s)" || message.includes("📎")) {
      return {
        text: "🗃️ Document(s)",
        className: hasUnreadMessages ? "text-light" : "text-gray",
      };
    }

    if (message.includes("📷") || message === "Photo") {
      return {
        text: "📷 Photo(s)",
        className: hasUnreadMessages ? "text-light" : "text-gray",
      };
    }

    if (message.includes("🎵") || message.includes("audio")) {
      return {
        text: "🎵 Audio(s)",
        className: hasUnreadMessages ? "text-light" : "text-gray",
      };
    }
    if (message.includes("@[")) {
      const mentionMatch = message.match(/@\[(.+?)\]\((\d+)\)/);
      if (mentionMatch) {
        const mentionName = mentionMatch[1];
        return {
          text: `@${mentionName}`,
          className: hasUnreadMessages ? "text-light" : "text-gray",
        };
      }
      return {
        text: "@mention",
        className: hasUnreadMessages ? "text-light" : "text-gray",
      };
    }

    if (message.startsWith("http")) {
      try {
        const url = new URL(message);
        return {
          text: `🔗 ${url.hostname}`,
          className: hasUnreadMessages ? "text-light" : "text-gray",
        };
      } catch {
        return {
          text: "🔗 Link",
          className: hasUnreadMessages ? "text-light" : "text-gray",
        };
      }
    }

    // handle group messages with sender name
    if (isGroup && message.includes(":")) {
      const parts = message.split(":");
      const sender = parts[0];
      const content = parts.slice(1).join(":").trim();

      if (content.length > 30) {
        return {
          text: `${sender}: ${content.substring(0, 30)}...`,
          className: hasUnreadMessages ? "text-light" : "text-gray",
        };
      }

      return {
        text: message,
        className: hasUnreadMessages ? "text-light" : "text-gray",
      };
    }

    // regular message truncation
    if (message.length > 35) {
      message = message.substring(0, 35) + "...";
    }

    return {
      text: message,
      className: hasUnreadMessages ? "text-light" : "text-gray",
    };
  }, [
    data.message,
    data.lastMessage,
    data.isTyping,
    hasUnreadMessages,
    isGroup,
  ]);

  // message status icons
  const renderMessageStatus = () => {
    if (data.isSeen) {
      return <Check2Icon className="w-4 h-4 text-blue" />;
    } else if (data.lastMessage) {
      return <Check2Icon className="w-4 h-4 text-gray" />;
    }
    return null;
  };

  return (
    <div className="bg-foreground">
      <div
        className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ${
          isSelected ? "bg-dark3" : "hover:bg-dark3 active:bg-dark2"
        }`}
        onClick={handleClick}
      >
        {/* avatar section */}
        <div className="relative mr-3 flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-dark3 border border-dark flex items-center justify-center">
            {!imageError && data.photo ? (
              <img
                src={
                  isGroup
                    ? `${import.meta.env.VITE_API_ASSETS_URL}/groupimages/${
                        data.photo
                      }`
                    : `${import.meta.env.VITE_API_ASSETS_URL}/photos/${
                        data.photo
                      }`
                }
                alt={data.name ?? "profile"}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : isGroup ? (
              <UsersIcon className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-full h-full object-cover" />
            )}
          </div>

          {/* online indicator for users */}
          {!isGroup && data.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green2 rounded-full border-2 border-dark"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <h3
                className={`font-normal text-base truncate ${
                  hasUnreadMessages ? "text-light" : "text-light"
                }`}
              >
                {data.name || data.groupName}
              </h3>

              {/* admin badge for groups */}
              {isGroup && data.isAdmin && (
                <div className="flex-shrink-0 w-4 h-4 bg-green2 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-light" />
                </div>
              )}
            </div>

            <span className="text-gray text-xs font-normal ml-2 flex-shrink-0">
              {formatTime(data.lastMessageDate || "")}
            </span>
          </div>

          {/* bottom row: Message and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {/* message status for sent messages */}
              {!isGroup && renderMessageStatus()}

              {/* typing indicator */}
              {messagePreview.isTyping && (
                <div className="flex space-x-0.5 mr-1">
                  <div className="w-1 h-1 bg-green2 rounded-full animate-bounce"></div>
                  <div
                    className="w-1 h-1 bg-green2 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-green2 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              )}

              {/* message preview */}
              <p className={`text-sm truncate ${messagePreview.className}`}>
                {messagePreview.text}
              </p>
            </div>

            {/* unread count */}
            {hasUnreadMessages && (
              <div className="bg-green2 text-dark text-xs rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center font-semibold ml-2">
                {(data.unreadCount ?? 0) > 99 ? "99+" : data.unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
