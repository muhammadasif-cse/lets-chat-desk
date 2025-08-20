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
};

export default initialState;
