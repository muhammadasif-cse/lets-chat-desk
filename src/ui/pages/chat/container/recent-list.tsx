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
        filteredChats.map((data, index) => <Users key={index} data={data} />)
      )}
    </div>
  );
};

export default RecentList;
