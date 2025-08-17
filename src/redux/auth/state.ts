/**
 * @format
 */

import { TUser } from "../../ui/types/user.type";


export type TAuthState = {
  token: string;
  session_time: number;
  auth: TUser | null;
  permissions: [];
};

const initialState: TAuthState = {
  token: "",
  session_time: 0,
  auth: null,
  permissions: [],
};

export default initialState;
