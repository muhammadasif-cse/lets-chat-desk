/** @format */
import { TAuthState } from "../../redux/auth/state";
import { useDispatch } from "react-redux";
import { getAuth, removeAuth, setAuth } from "../lib/utils/cookies";
import { setCredentials } from "../../redux/auth/action";

export default function useAuth() {
  const dispatch = useDispatch();

  const setAuthInfo = (payload: TAuthState) => {
    if (payload?.token) {
      setAuth({
        data: payload?.token,
        name: "token",
        expire: payload?.session_time,
      });
    }
    if (payload?.auth) {
      setAuth({
        data: payload?.auth,
        name: "user",
        expire: payload?.session_time,
      });
    }
    if (payload?.permissions && payload?.permissions?.length > 0) {
      setAuth({
        data: payload?.permissions,
        name: "permissions",
        expire: payload?.session_time,
      });
    }
  };

  const getAuthInfo = () => {
    const auth = getAuth();
    const auth_token = auth?.token;
    const auth_user = auth?.user;
    const auth_permission = auth?.permissions;

    return {
      access_token: auth_token,
      user: auth_user,
      permission: auth_permission,
    };
  };

  const setAuthState = () => {
    dispatch(setCredentials(getAuthInfo()));
  };

  const removeAuthInfo = () => {
    removeAuth();
  };

  const isLoggedIn = () => {
    const authInfo = getAuthInfo();
    return !!(authInfo.access_token && authInfo.user);
  };

  const isAuthenticated = isLoggedIn();

  const isTokenValid = () => {
    const authInfo = getAuthInfo();
    return !!authInfo.access_token;
  };

  const logout = () => {
    removeAuthInfo();
  };

  const refresh = () => {
    setAuthState();
  };

  const hasRole = (requiredRole: number) => {
    const authInfo = getAuthInfo();
    return authInfo.user && (authInfo.user as any).roleOrder >= requiredRole;
  };

  const hasService = (serviceName: string) => {
    const authInfo = getAuthInfo();
    const permissions = authInfo.permission as any[];
    return permissions?.some(
      (permission: any) =>
        permission.name === serviceName || permission.code === serviceName
    );
  };

  return {
    setAuthInfo,
    setAuthState,
    getAuthInfo,
    removeAuthInfo,
    isLoggedIn,
    isAuthenticated,
    isTokenValid,
    logout,
    refresh,
    hasRole,
    hasService,
  };
}
