/* eslint-disable @typescript-eslint/no-explicit-any */
/** @format */

import { IMessage } from "../../interfaces/chat";

export type TResponse<T> = {
  code?: number;
  status: boolean;
  message: string;
  result: T | any;
  errors: any;
};

export type TChatApiResponse = {
  code: number;
  status: string;
  message: string;
  result: {
    isOnline: boolean;
    totalOnline: number;
    type: "user" | "group";
    count: number;
    messages: IMessage[];
  };
};

export type TPagination = {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};
