/** @format */

import { TCookies, TSetCookies } from "../../types/cookies.type";
import Cookies from "js-cookie";

export const setAuth = ({ data, name, expire }: TSetCookies): void => {
  Cookies.set(name, JSON.stringify(data), {
    // convert min to days
    expires: expire ? new Date(Date.now() + expire * 60 * 1000) : undefined,
    // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    secure: false,
    sameSite: "Lax", // protect against CSRF attacks
  });
};

export const getAuth = (): TCookies => {
  const token = Cookies.get("token");
  const user = Cookies.get("user");
  const permissions = Cookies.get("permissions");

  return {
    token: token ? JSON.parse(token) : "",
    user: user ? JSON.parse(user) : null,
    permissions: permissions ? JSON.parse(permissions) : [],
  };
};

export const removeAuth = (): void => {
  Cookies.remove("token");
  Cookies.remove("user");
  Cookies.remove("permissions");
};
