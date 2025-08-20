import { Check } from "lucide-react";
import { useState } from "react";
import { Check2Icon } from "../../../assets/icons/check.icon";
import { UserIcon, UsersIcon } from "../../../assets/icons/users.icon";
import { IUsersProps } from "../../../types/user.type";
import { formatTime } from "../utils/time-formatting";
import MessagePreview from "./message-preview";

const Users = ({ data, isSelected = false, onUserSelect }: IUsersProps) => {
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

  // message status icons
  const renderMessageStatus = () => {
    if ((data as any).isSeen) {
      return <Check2Icon className="text-blue" />;
    } else if (data.lastMessage) {
      return <Check2Icon className="text-gray" />;
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
                src={`${import.meta.env.VITE_API_ASSETS_URL}/${
                  isGroup ? "group-images" : "photos"
                }/${data.photo}`}
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
          {!isGroup && (data as any).isOnline && (
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
                {data.name}
              </h3>

              {/* admin badge for groups */}
              {isGroup && data.isAdmin && (
                <div className="flex-shrink-0 w-4 h-4 bg-green2 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-dark" />
                </div>
              )}
            </div>

            <span className="text-gray text-xs font-normal ml-2 flex-shrink-0">
              {formatTime(data.lastMessageDate || "")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {!isGroup && renderMessageStatus()}
              <MessagePreview
                message={data.lastMessage}
                lastMessage={data.lastMessage}
                isTyping={(data as any).isTyping}
                hasUnreadMessages={hasUnreadMessages}
                isGroup={isGroup}
              />
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
