import * as signalR from "@microsoft/signalr";

export interface ISignalRProps {
  connection: signalR.HubConnection | null;
  sendMessage: (message: any) => void;
  markMultipleMessageAsSeen: (
    senderId: number,
    type: string,
    groupId: string | null
  ) => void;
  receiveApprovedRequest: (
    messageId: string,
    type: string,
    approverId?: number | null
  ) => void;
  approvalDecision: (
    messageId: string,
    isApprove: boolean,
    type: string
  ) => void;
  notifyTypingStatus: (
    fromUserId: number,
    toUserId: number,
    isTyping: boolean,
    type: "group" | "user",
    groupId?: string | null
  ) => void;
  deleteRequest: (messageId: string, type: string) => void;
  deleteMessage: (messageId: string, type: string) => void;
  cancelDeleteRequest: (messageId: string, type: string) => void;
  setModifyMessage: (
    messageId: string,
    newMessage: string,
    type: string
  ) => any;
  setMessageReaction: (
    messageId: string,
    reaction: string,
    type: string
  ) => void;
  checkConnection: () => boolean;
  getConnection: () => signalR.HubConnection | null;
  selectedUserInfoRef: any;
  isConnected: boolean;
  connectionError: string | null;
  connectionMetrics: any;
  reconnect: () => Promise<void>;
  forceReconnect: () => Promise<void>;
}

export interface IConnectionMetrics {
  lastConnected: number | null;
  totalDisconnections: number;
  averageReconnectTime: number;
  connectionQuality: "excellent" | "good" | "poor" | "critical";
}
