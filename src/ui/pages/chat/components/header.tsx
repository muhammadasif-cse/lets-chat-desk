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
import { IHeaderProps } from "../../../../interfaces/chat";
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
      if (selectedChat.memberCount && selectedChat.totalOnline) {
        return `${selectedChat.memberCount} members, ${selectedChat.totalOnline} online`;
      } else if (selectedChat.memberCount) {
        return `${selectedChat.memberCount} members`;
      } else if (selectedChat.totalOnline) {
        return `${selectedChat.totalOnline} online`;
      }
      return "Group";
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
    <div className="h-16 bg-foreground border-b border-dark4 flex items-center px-4 relative z-30">
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 p-2 hover:bg-dark4 text-gray hover:text-light lg:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
        </Button>
      )}

      {/* avatar and Info */}
      <div
        className="flex items-center space-x-3 flex-1 cursor-pointer"
        onClick={onInfo}
      >
        <div className="relative">
          <div className="w-10 h-10 border border-dark rounded-full overflow-hidden bg-dark3 flex items-center justify-center">
            {!imageError && selectedChat.photo ? (
              <img
                src={`${import.meta.env.VITE_API_ASSETS_URL}/${
                  isGroup ? "groupimages" : "photos"
                }/${selectedChat.photo}`}
                alt={selectedChat.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : isGroup ? (
              <UsersIcon className="size-4 text-gray" />
            ) : (
              <User className="size-4 text-gray" />
            )}
          </div>

          {/* Online indicator */}
          {!isGroup && selectedChat.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green2 rounded-full border-2 border-foreground"></div>
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
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-dark4 text-gray hover:text-light p-2"
          onClick={onSearch}
        >
          <Search className="size-4" />
        </Button>

        {/* video call (only for users) */}
        {!isGroup && (
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-dark4 text-gray hover:text-light p-2"
            onClick={onVideoCall}
          >
            <Video className="size-4" />
          </Button>
        )}

        {/* voice call */}
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-dark4 text-gray hover:text-light p-2"
          onClick={onCall}
        >
          <Phone className="size-4" />
        </Button>

        {/* more options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-dark4 text-gray hover:text-light p-2"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-dark4 border-dark4 text-light min-w-[180px] z-50"
            sideOffset={8}
          >
            <DropdownMenuItem
              className="hover:bg-dark3 focus:bg-dark3 cursor-pointer text-light"
              onClick={onInfo}
            >
              <Info className="size-4 mr-2" />
              Contact info
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-dark3 focus:bg-dark3 cursor-pointer text-light">
              <VolumeXIcon className="size-4 mr-2" />
              Mute notifications
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-dark3 focus:bg-dark3 cursor-pointer text-light">
              <MessageCircleMoreIcon className="size-4 mr-2" />
              Awaiting Approval
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-dark3 focus:bg-dark3 cursor-pointer text-light">
              <BadgeCheckIcon className="size-4 mr-2" />
              Approved Messages
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-dark3 focus:bg-dark3 cursor-pointer text-light">
              <Trash2Icon className="size-4 mr-2" />
              Delete Requests
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-dark3 focus:bg-dark3 cursor-pointer text-light">
              <MessageCircleXIcon className="size-4 mr-2" />
              Rejected Messages
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
