import { useEffect, useRef } from "react";
import { useFilteredChats } from "../../../hooks/useFilteredChats";
import { useGetRecentUsers } from "../../../hooks/useGetRecentUsers";
import Users from "../components/users";
import UsersSkeleton from "../components/users-skeleton";

interface RecentListProps {
  onUserSelect?: (user: any) => void;
  selectedUserId?: string;
}

// Sample data for development
const sampleUsers = [
  {
    id: 1,
    name: "John Doe",
    message: "Hey! How are you doing?",
    photo: null,
    lastMessageDate: "2024-08-19T10:30:00Z",
    unreadCount: 2,
    type: "user" as const,
    isSeen: false,
    isOnline: true,
    isAdmin: false,
  },
  {
    id: 2,
    name: "Jane Smith",
    message: "Thanks for the help yesterday 👍",
    photo: null,
    lastMessageDate: "2024-08-19T09:15:00Z",
    unreadCount: 0,
    type: "user" as const,
    isSeen: true,
    isOnline: false,
    isAdmin: false,
  },
  {
    id: 3,
    name: "Team Project",
    message: "Alice: The new features are ready for testing",
    photo: null,
    lastMessageDate: "2024-08-19T08:45:00Z",
    unreadCount: 5,
    type: "group" as const,
    isSeen: false,
    isOnline: false,
    isAdmin: true,
    groupName: "Team Project",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    message: "See you at the meeting tomorrow",
    photo: null,
    lastMessageDate: "2024-08-18T16:20:00Z",
    unreadCount: 0,
    type: "user" as const,
    isSeen: true,
    isOnline: true,
    isAdmin: false,
  },
  {
    id: 5,
    name: "Development Team",
    message: "Bob: Code review is complete ✅",
    photo: null,
    lastMessageDate: "2024-08-18T14:30:00Z",
    unreadCount: 1,
    type: "group" as const,
    isSeen: false,
    isOnline: false,
    isAdmin: false,
    groupName: "Development Team",
  },
];

const RecentList = ({ onUserSelect, selectedUserId }: RecentListProps) => {
  const { handleRecentChatUsers, isLoading } = useGetRecentUsers();
  const filteredChats = useFilteredChats();
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!hasCalledRef.current && !isLoading) {
      hasCalledRef.current = true;
      handleRecentChatUsers();
    }
  }, [handleRecentChatUsers, isLoading]);

  // Use sample data if no real data is available
  const chatsToShow = filteredChats.length > 0 ? filteredChats : sampleUsers;

  return (
    <div
      className="h-screen overflow-auto custom-scrollbar"
      style={{
        scrollbarColor: "#2a3942 #111B21",
        scrollbarWidth: "thin",
      }}
    >
      {isLoading ? (
        <UsersSkeleton skeleton={14} />
      ) : (
        chatsToShow.map((data, index) => (
          <Users
            key={data.id || index}
            data={data}
            onUserSelect={onUserSelect}
            isSelected={selectedUserId === data.id?.toString()}
          />
        ))
      )}
    </div>
  );
};

export default RecentList;
