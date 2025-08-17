/**
 * eslint-disable @typescript-eslint/no-explicit-any
 *
 * @format
 */

import { userCookies } from "../ui/utils/cookies";
import { TResponse } from "../ui/types/api-response.type";
import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_HTTP}://${import.meta.env.VITE_API_HOST}`,

  prepareHeaders: (headers) => {
    const auth = userCookies.getUserData();
    headers.set("ngrok-skip-browser-warning", "true");

    if (auth?.token) {
      headers.set("authorization", `Bearer ${auth?.token}`);
    } else {
      headers.set("authorization", import.meta.env.VITE_API_SECRETE_TOKEN || "");
    }
    
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const formatErrorResponse = (code: number, message?: string, errors?: any) => {
  return {
    error: {
      success: false,
      code: code,
      message: message,
      errors: errors ?? null,
    },
  };
};

const formatSuccessResponse = (
  success: boolean,
  code: number,
  message?: string,
  data?: any | any[],
  errors?: any
) => {
  return {
    error: {
      success: success,
      code: code,
      message: message,
      data: data ?? null,
      errors: errors ?? null,
    },
  };
};
const baseQueryWithReactAuth = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  const result: any = await baseQuery(args, api, extraOptions);

  if (!window.navigator.onLine) {
    return formatErrorResponse(
      503,
      "You're offline. Check your internet connection."
    );
  }

  if (result?.error?.status === 401) {
    const response_data = result?.error?.data as TResponse;
    return formatErrorResponse(
      result?.error?.status,
      response_data?.message,
      response_data?.errors
    );
  }
  if (
    parseInt(result?.error?.status) < 600 &&
    parseInt(result?.error?.status) > 200
  ) {
    return formatErrorResponse(
      result?.error?.status,
      result?.error?.data?.message,
      result?.error?.data?.errors
    );
  }
  if (result?.error?.status === "FETCH_ERROR") {
    return formatErrorResponse(
      503,
      `Failed to fetch! Check server connections`,
      result?.error?.error
    );
  }
  if (result?.error?.status === 200) {
    return formatSuccessResponse(
      result?.data?.success,
      result?.error?.status,
      result?.data?.message,
      result?.data?.data,
      result?.data?.errors
    );
  }
  return result;
};

const APIHeader = createApi({
  baseQuery: baseQueryWithReactAuth,
  endpoints: () => ({}),
});

export default APIHeader;
