/* eslint-disable @typescript-eslint/no-explicit-any */
/** @format */

export type TResponse = {
  code?: number;
  status: boolean;
  message: string;
  data: any;
  errors: any;
};
export type TPagination = {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};
