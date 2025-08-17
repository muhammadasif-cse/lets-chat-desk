/** @format */

import { TUser } from "./user.type";

export type TSetCookies = {
  data: object | string | [];
  name: string;
  expire: number;
};
export type TCookies = {
  token: string;
  user: TUser | null;
  permissions: object[] | null;
};
