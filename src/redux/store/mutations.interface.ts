interface IGetChats {
  userId: number;
  toUserId: number;
  groupId: string;
  type: string;
  callCount?: number;
}
