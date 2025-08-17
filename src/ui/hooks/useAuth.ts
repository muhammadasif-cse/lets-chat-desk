/** @format */
import { useDispatch, useSelector } from "react-redux";
import { userCookies } from "../utils/cookies";
import {
  setCredentials,
  logout as logoutAction,
  syncAuthFromCookies,
} from "../../redux/auth/action";
import { RootState } from "../../redux/store";
import { useEffect } from "react";

export default function useAuth() {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  //! sync with cookies on mount
  useEffect(() => {
    const isLoggedIn = userCookies.isLoggedIn();
    const userData = userCookies.getUserData();
    if (authState.isAuthenticated !== isLoggedIn) {
      dispatch(syncAuthFromCookies({ isLoggedIn, userData }));
    }
  }, [authState.isAuthenticated, dispatch]);

  const setAuthInfo = (userData: any, rememberMe: boolean = false) => {
    userCookies.setUserData(userData, rememberMe);

    dispatch(
      setCredentials({
        token: userData.token,
        user: {
          userId: userData.userId,
          fullName: userData.fullName,
          userName: userData.userName,
          photo: userData.photo,
          roleOrder: userData.roleOrder,
          branchId: userData.branchId,
          departmentId: userData.departmentId,
          services: userData.services || [],
        },
      })
    );
  };

  const getAuthInfo = () => {
    return {
      access_token: authState.token,
      user: authState.user,
      permission: authState.user?.services || [],
    };
  };

  const refresh = () => {
    const isLoggedIn = userCookies.isLoggedIn();
    const userData = userCookies.getUserData();
    dispatch(syncAuthFromCookies({ isLoggedIn, userData }));
  };

  const logout = () => {
    userCookies.clearUserData();
    dispatch(logoutAction());
  };

  const isLoggedIn = () => {
    return authState.isAuthenticated;
  };

  const isTokenValid = () => {
    return !!(authState.token && authState.user);
  };

  const hasRole = (requiredRole: number) => {
    return authState.user && authState.user.roleOrder >= requiredRole;
  };

  const hasService = (serviceName: string) => {
    const services = authState.user?.services || [];
    return services.some(
      (service: any) =>
        service.name === serviceName || service.code === serviceName
    );
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
    user: authState.user,

    setAuthInfo,
    getAuthInfo,
    removeAuthInfo: logout,
    setAuthState: refresh,

    isLoggedIn,
    isTokenValid,
    logout,
    refresh,
    hasRole,
    hasService,
  };
}
