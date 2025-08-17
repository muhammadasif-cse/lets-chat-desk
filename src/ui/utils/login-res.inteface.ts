export interface ILoginRes {
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
