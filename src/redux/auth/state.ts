/**
 * @format
 */

import { TUser } from "../../ui/types/user.type";

export type TAuthState = {
  isAuthenticated: boolean;
  token: string;
  user: TUser | null;
};

const initialState: TAuthState = {
  isAuthenticated: false,
  token: "",
  user: null,
};

export default initialState;
