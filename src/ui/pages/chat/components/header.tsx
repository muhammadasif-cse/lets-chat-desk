import {
  ArrowLeft,
  BadgeCheckIcon,
  Info,
  MessageCircleMoreIcon,
  MessageCircleXIcon,
  MoreVertical,
  Phone,
  Search,
  Trash2Icon,
  User,
  Users as UsersIcon,
  Video,
  VolumeXIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

const Header = ({
  selectedChat,
  onBack,
  onCall,
  onVideoCall,
  onSearch,
  onInfo,
}: IHeaderProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (!selectedChat) {
    return (
      <div className="h-16 bg-dark3 border-b border-dark4 flex items-center justify-center">
        <h1 className="text-light text-lg font-medium">
          Select a chat to start messaging
        </h1>
      </div>
    );
  }

  const isGroup = selectedChat.type === "group";

  const getStatusText = () => {
    if (isGroup) {
      return selectedChat.memberCount
        ? `${selectedChat.memberCount} members`
        : "Group";
    }

    if (selectedChat.isOnline) {
      return "online";
    }

    if (selectedChat.lastSeen) {
      const lastSeenDate = new Date(selectedChat.lastSeen);
      const now = new Date();
      const diffInMs = now.getTime() - lastSeenDate.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) {
        return "last seen just now";
      } else if (diffInMinutes < 60) {
        return `last seen ${diffInMinutes} minutes ago`;
      } else if (diffInHours < 24) {
        return `last seen ${diffInHours} hours ago`;
      } else if (diffInDays === 1) {
        return "last seen yesterday";
      } else {
        return `last seen ${diffInDays} days ago`;
      }
    }

    return "offline";
  };

  return (
    <div className="h-16 bg-foreground border-b border-dark4 flex items-center px-4">
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 p-2 hover:bg-dark4 text-gray hover:text-light lg:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      )}

      {/* avatar and Info */}
      <div className="flex items-center space-x-3 flex-1" onClick={onInfo}>
        {/* avatar */}
        <div className="relative">
          <div className="w-10 h-10 border border-dark rounded-full overflow-hidden bg-dark3 flex items-center justify-center">
            {!imageError && selectedChat.photo ? (
              <img
                src={
                  isGroup
                    ? `${import.meta.env.VITE_API_ASSETS_URL}/groupimages/${
                        selectedChat.photo
                      }`
                    : `${import.meta.env.VITE_API_ASSETS_URL}/photos/${
                        selectedChat.photo
                      }`
                }
                alt={selectedChat.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : isGroup ? (
              <UsersIcon className="w-5 h-5 text-gray" />
            ) : (
              <User className="w-5 h-5 text-gray" />
            )}
          </div>

          {/* Online indicator */}
          {!isGroup && selectedChat.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green2 rounded-full border-2 border-dark4"></div>
          )}
        </div>

        {/* Chat info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-light font-medium text-base truncate">
            {selectedChat.name}
          </h2>
          <p className="text-gray text-sm truncate">{getStatusText()}</p>
        </div>
      </div>

      {/* action buttons */}
      <div className="flex items-center space-x-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-dark4 text-gray hover:text-light"
          onClick={onSearch}
        >
          <Search className="w-5 h-5" />
        </Button>

        {/* video call (only for users) */}
        {!isGroup && (
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-dark4 text-gray hover:text-light"
            onClick={onVideoCall}
          >
            <Video className="w-5 h-5" />
          </Button>
        )}

        {/* voice call */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-dark4 text-gray hover:text-light"
          onClick={onCall}
        >
          <Phone className="w-5 h-5" />
        </Button>

        {/* more options */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-dark4 text-gray hover:text-light"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-dark4 border-dark4 text-light min-w-[180px]"
          >
            <DropdownMenuItem
              className="hover:bg-dark4 cursor-pointer"
              onClick={onInfo}
            >
              <Info className="w-4 h-4" />
              Contact info
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-dark4 cursor-pointer">
              <VolumeXIcon className="w-4 h-4" />
              Mute notifications
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-dark4 cursor-pointer">
              <MessageCircleMoreIcon className="w-4 h-4" />
              Awaiting Approval
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-dark4 cursor-pointer">
              <BadgeCheckIcon className="w-4 h-4" />
              Approved Messages
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-dark4 cursor-pointer">
              <Trash2Icon className="w-4 h-4" />
              Delete Requests
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-dark4 cursor-pointer">
              <MessageCircleXIcon className="w-4 h-4" />
              Rejected Messages
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
