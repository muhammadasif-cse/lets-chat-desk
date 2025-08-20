import { TChatState } from "./state.interface";

const initialState: TChatState = {
  recentUsers: [],
  permissions: [],
  searchQuery: "",
};

export default initialState;
