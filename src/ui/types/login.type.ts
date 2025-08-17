export type TLogin = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

export type TLoginResponse = {
  code: number;
  message: string;
  result?: {
    token: string;
    fullName: string;
    userName: string;
    userId: number;
    roleOrder: number;
    photo: string;
    needChangePassword: boolean;
    branchId: number;
    departmentId: number;
    services: Array<{
      id: number;
      code: string;
      url: string;
      name: string;
    }>;
  };
};
