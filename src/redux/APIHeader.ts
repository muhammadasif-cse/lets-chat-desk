import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "",
  prepareHeaders: (headers) => {
    const auth = getAuth();
    const token = auth?.token
      ? `Bearer ${auth?.token}`
      : import.meta.env.SECRETE_TOKEN
      ? import.meta.env.SECRETE_TOKEN
      : "";
    if (token) {
      headers.set("authorization", token);
      headers.set("Current-Route", window.location.pathname);
    }

    return headers;
  },
});

const baseQueryWithReactAuth = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === "FETCH_ERROR") {
    return {
      error: {
        success: false,
        message: "Server Error! Failed to fetch",
      },
    };
  }

  if (
    result?.meta?.response?.statusText === "Unauthorized" &&
    result?.meta?.response?.status == 401
  ) {
    removeAuth();
    if (window.location.pathname != "/login") {
      window.location.href = "/auth/login";
    }

    return result;
  }

  return result;
};

const APIHeader = createApi({
  baseQuery: baseQueryWithReactAuth,
  endpoints: () => ({}),
});

export default APIHeader;
