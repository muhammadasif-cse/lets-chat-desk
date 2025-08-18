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

export interface IRecentChatUsers {
  id: number;
  groupId?: string | null;
  groupName?: string | null;
  name: string;
  photo?: string | null;
  message: string;
  lastMessageId?: string;
  lastMessage?: string;
  lastMessageDate?: string;
  tags?: { userName: string; userId: number }[];
  attachments?: { filePath?: string | null; fileName: string }[];
  date?: string;
  isSeen?: boolean;
  userId?: number;
  toUserId?: number;
  type: "user" | "group";
  isTyping?: boolean;
  isOnline?: boolean;
  unreadCount?: number;
  isApprovalNeeded?: boolean;
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
  user: any;
  newGroup?: boolean;
  selected?: boolean;
  onToggle?: () => void;
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
