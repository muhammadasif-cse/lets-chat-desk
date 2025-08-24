import { IConnectionMetrics } from "@/interfaces/signalR";

export const initialConnectionMetrics = {
  lastConnected: null,
  totalDisconnections: 0,
  averageReconnectTime: 0,
  connectionQuality: "excellent" as IConnectionMetrics["connectionQuality"],
};
export const SOUND_FILES = {
  MESSAGE_TONE: "/files/message.mp3",
} as const;
