import { TChatState } from "./state.interface";

const initialState: TChatState = {
  recentUsers: [],
  permissions: [],
  searchQuery: "",
  chats: [],
};

export default initialState;
