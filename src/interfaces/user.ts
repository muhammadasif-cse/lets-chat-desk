export interface IUserInfo {
  id: number;
  name: string;
  description?: string | null;
  photo?: string | null;
  isOnline?: boolean;
  lastOnline?: string | null;
  type: "user" | "group";
  phone?: string | null;
  email?: string | null;
  department?: string | null;
  isAdmin?: boolean;
  isEditGroupSettings?: boolean;
  isSendMessages?: boolean;
  isAddMembers?: boolean;
  hasDeleteRequest?: boolean;
}

export type IMemberPermission = {
  userId: number;
  name: string;
  photo?: string;
  permissions: string[];
};

export interface IUserItemProps {
  user: TUser;
  newGroup?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}
export interface IRecentUser {
  id: string;
  name: string;
  photo: string;
  description: string | null;
  type: "user" | "group";
  lastMessage: string;
  lastMessageId: string;
  lastMessageDate: string;
  unreadCount: number;
  isAdmin: boolean;
  isEditGroupSettings: boolean;
  isSendMessages: boolean;
  isAddMembers: boolean;
  hasDeleteRequest: boolean;
}

export type TUser = {
  id: number;
  isActive: boolean;
  name: string;
  userName: string;
  password: string;
  branchId: number;
  userType: string;
  email: string;
  contactNo: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  nationality: string;
  photo: string;
  signature: string;
  additionalPhoneNo: string;
  nid: string;
  nidImage: string;
  drivingLicenseNo: string;
  drivingLicenseImage: string;
  birthCertificateNo: string;
  birthCertificateImage: string;
  passportNo: string;
  passportImage: string;
  presentAddress: string;
  permanentAddress: string;
  mailingAddress: string;
  officeAddress: string;
  profession: string;
  grade: string;
  departmentId: string;
  designationId: string;
  designation: string;
  department: string;
  employeeCode: string;
  employeeIdCardImage: string;
  fathersName: string;
  fathersNidNo: string;
  mothersName: string;
  mothersNidNo: string;
  spouseName: string;
  spouseNidNo: string;
  emergencyContactName: string;
  emergencyContactNo: string;
  emergencyContactRelation: string;
  joiningDate: string;
  comment: string;
  religion: string;
  maritalStatus: string;
  expireDate: string;
  terminationDate: string;
  disabilities: string;
  roleId: number;
  isOnline?: boolean;
};
