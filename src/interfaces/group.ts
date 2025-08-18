export interface IGroup {
  name: string;
  description: string;
  file: File | null | string;
  memberList: IGroupPermissions[];
}

export interface IGroupPermissions {
  userId: number;
  isAdmin: boolean;
  isEditGroupSettings: boolean;
  isSendMessages: boolean;
  isRemoveMembers: boolean;
  isAddMembers: boolean;
  isEditMessages: boolean;
  isDeleteMessages: boolean;
  isDeleteGroup: boolean;
  isApproveNewMembers: boolean;
}

export interface IGroupFormProps {
  groupImage: File | string;
  groupName: string;
  groupDescription: string;
  editingGroupId?: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPermissionsClick: () => void;
  disabled: boolean;
  editMode: boolean;
}
