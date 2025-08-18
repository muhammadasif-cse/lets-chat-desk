import { useEffect, useRef } from "react";
import { useFilteredChats } from "../../../hooks/useFilteredChats";
import { useGetRecentUsers } from "../../../hooks/useGetRecentUsers";
import Users from "../components/users";
import UsersSkeleton from "../components/users-skeleton";

const RecentList = () => {
  const { handleRecentChatUsers, isLoading } = useGetRecentUsers();
  const filteredChats = useFilteredChats();
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!hasCalledRef.current && !isLoading) {
      hasCalledRef.current = true;
      handleRecentChatUsers();
    }
  }, [handleRecentChatUsers, isLoading]);

  return isLoading ? (
    <UsersSkeleton skeleton={10} />
  ) : (
    filteredChats.map((data, index) => (
      <Users
        key={index}
        data={data}
        // onUserSelect={onUserSelect}
        // editingGroupId={editingGroupId}
        // setEditingGroupId={setEditingGroupId}
        // key={index}
        // chat={chat}
        // unreadCount={chat.unreadCount}
        // markMultipleMessageAsSeen={markMultipleMessageAsSeen}
      />
    ))
  );
};

export default RecentList;
