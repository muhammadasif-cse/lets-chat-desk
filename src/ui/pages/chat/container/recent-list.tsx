import { useEffect, useRef } from "react";
import { IChatItem } from "../../../../interfaces/chat";
import { useFilteredChats } from "../../../hooks/useFilteredChats";
import { useGetRecentUsers } from "../../../hooks/useGetRecentUsers";
import Users from "../components/users";
import UsersSkeleton from "../components/users-skeleton";

interface RecentListProps {
  onUserSelect?: (user: IChatItem) => void;
  selectedUserId?: string;
}

const RecentList = ({ onUserSelect, selectedUserId }: RecentListProps) => {
  const { handleRecentUsers, isLoading } = useGetRecentUsers();
  const filteredChats = useFilteredChats();
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!hasCalledRef.current && !isLoading) {
      hasCalledRef.current = true;
      handleRecentUsers();
    }
  }, [handleRecentUsers, isLoading]);

  const chatsToShow = filteredChats.length > 0 ? filteredChats : [];

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
