import { TChatState } from "./state.interface";

const initialState: TChatState = {
  recentUsers: [],
  permissions: [],
  searchQuery: "",
  chats: [],
  currentCallCount: 0,
  loadedCallCounts: [],
  hasMorePrevious: false,
  hasMoreNext: false,
  isLoadingMessages: false,
  selectedChatId: null,
  error: null,
  typingStatus: null,
};

export default initialState;
