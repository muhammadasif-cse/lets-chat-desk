import { useMemo } from "react";
import { IRecentUsers } from "../../interfaces/user";
import { useAppSelector } from "../../redux/selector";

export const useFilteredChats = (): IRecentUsers[] => {
  const { recentUsers, searchQuery } = useAppSelector((state) => state.chat);
  const filteredChats = useMemo(() => {
    let chats = [...recentUsers];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      chats = chats.filter(
        (chat) =>
          chat.name?.toLowerCase().includes(query) ||
          (chat.message && chat.message.toLowerCase().includes(query))
      );
    }

    const unseen = chats.filter((chat) => !chat.isSeen);
    const seen = chats.filter((chat) => chat.isSeen);

    return [...unseen, ...seen];
  }, [recentUsers, searchQuery]);
  return filteredChats;
};
