import { useMemo } from "react";
import { useAppSelector } from "../../redux/selector";
import { IRecentChatUsers } from "../../interfaces/user";

export const useFilteredChats = (): IRecentChatUsers[] => {
  const { recentChatUsers, searchQuery } = useAppSelector(
    (state) => state.chat
  );
  const filteredChats = useMemo(() => {
    let chats = [...recentChatUsers];
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
  }, [recentChatUsers, searchQuery]);
  return filteredChats;
};
