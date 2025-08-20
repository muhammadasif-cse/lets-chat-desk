import { useMemo } from "react";
import { IRecentUser } from "../../interfaces/user";
import { useAppSelector } from "../../redux/selector";

export const useFilteredChats = (): IRecentUser[] => {
  const { recentUsers, searchQuery } = useAppSelector((state) => state.chat);
  const filteredChats = useMemo(() => {
    let chats = [...recentUsers];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      chats = chats.filter(
        (chat) =>
          chat.name?.toLowerCase().includes(query) ||
          (chat.lastMessage && chat.lastMessage.toLowerCase().includes(query))
      );
    }

    return chats;
  }, [recentUsers, searchQuery]);
  return filteredChats;
};
