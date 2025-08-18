/** @format */

import { IRecentChatUsers } from "../../interfaces/user";

export interface IUsersProps {
  data: IRecentChatUsers;
  isLast?: boolean;
  isSelected?: boolean;
  onUserSelect?: (data: IRecentChatUsers) => void;
}

export type TUser = {
  userId: number;
  fullName: string;
  userName: string;
  photo: string;
  roleOrder: number;
  branchId: number;
  departmentId?: number;
  needChangePassword?: boolean;
  services: TService[];
};

export type TService = {
  id: number;
  code: string;
  name: string;
  url: string;
  icon: string;
};
