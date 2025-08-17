export interface CookieOptions {
  expires?: Date | number;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export const cookies = {
  set: (name: string, value: string, options: CookieOptions = {}): void => {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}`;

    if (options.expires) {
      if (typeof options.expires === "number") {
        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
      } else {
        cookieString += `; expires=${options.expires.toUTCString()}`;
      }
    }

    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    } else {
      cookieString += `; path=/`;
    }

    if (options.secure) {
      cookieString += `; secure`;
    }

    if (options.httpOnly) {
      cookieString += `; httponly`;
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  },

  get: (name: string): string | null => {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  },

  getAll: (): Record<string, string> => {
    const cookies: Record<string, string> = {};
    const allCookies = document.cookie.split(";");

    for (let cookie of allCookies) {
      cookie = cookie.trim();
      if (cookie) {
        const [name, value] = cookie.split("=");
        if (name && value) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
      }
    }
    return cookies;
  },

  remove: (
    name: string,
    options: Pick<CookieOptions, "domain" | "path"> = {}
  ): void => {
    cookies.set(name, "", {
      ...options,
      expires: new Date(0),
    });
  },

  exists: (name: string): boolean => {
    return cookies.get(name) !== null;
  },
};

export interface UserData {
  token: string;
  fullName: string;
  userName: string;
  userId: number;
  roleOrder: number;
  photo: string;
  branchId: number;
  departmentId: number;
  services: Array<{
    id: number;
    code: string;
    url: string;
    name: string;
  }>;
}

export const userCookies = {
  setUserData: (userData: UserData, rememberMe: boolean = false): void => {
    const expires = rememberMe ? 30 : 8 / 24;
    const options: CookieOptions = {
      expires,
      secure: import.meta.env.PROD,
      sameSite: "lax",
    };

    cookies.set("auth_token", userData.token, options);
    cookies.set(
      "user_data",
      JSON.stringify({
        fullName: userData.fullName,
        userName: userData.userName,
        userId: userData.userId,
        roleOrder: userData.roleOrder,
        photo: userData.photo,
        branchId: userData.branchId,
        departmentId: userData.departmentId,
        services: userData.services,
      }),
      options
    );

    cookies.set("login_time", new Date().toISOString(), options);
  },

  getUserData: (): UserData | null => {
    const token = cookies.get("auth_token");
    const userData = cookies.get("user_data");

    if (!token || !userData) {
      return null;
    }

    try {
      const parsedUserData = JSON.parse(userData);
      return {
        token,
        ...parsedUserData,
      };
    } catch (error) {
      console.error("Error parsing user data from cookies:", error);
      return null;
    }
  },

  getAuthToken: (): string | null => {
    return cookies.get("auth_token");
  },

  isLoggedIn: (): boolean => {
    return cookies.exists("auth_token") && cookies.exists("user_data");
  },

  clearUserData: (): void => {
    cookies.remove("auth_token");
    cookies.remove("user_data");
    cookies.remove("login_time");
  },

  getLoginTime: (): Date | null => {
    const loginTime = cookies.get("login_time");
    return loginTime ? new Date(loginTime) : null;
  },

  refreshSession: (rememberMe: boolean = false): void => {
    const userData = userCookies.getUserData();
    if (userData) {
      userCookies.setUserData(userData, rememberMe);
    }
  },
};

export default cookies;
