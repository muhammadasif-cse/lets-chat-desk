/* eslint-disable @typescript-eslint/no-explicit-any */
/** @format */

export type TResponse<T> = {
  code?: number;
  status: boolean;
  message: string;
  result: T | any;
  errors: any;
};
export type TPagination = {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};
