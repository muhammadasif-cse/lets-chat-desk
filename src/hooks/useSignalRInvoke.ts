import { IMessage } from "@/interfaces/chat";
import { ISignalRProps } from "@/interfaces/signalR";
import { useAppSelector } from "@/redux/selector";
import {
    addOptimisticMessage,
    updateMessageStatus,
} from "@/redux/store/actions";
import * as signalR from "@microsoft/signalr";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSignalR } from "./useSignalR";
import { useSignalREvent } from "./useSignalREvent";

// handle global connection stable
let globalConnection: signalR.HubConnection | null = null;

export const useSignalRInvoke = (): ISignalRProps => {
  const dispatch = useDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { permissions, selectedChatId } = useAppSelector((state) => state.chat);

  //* refs for stable references
  const permissionsRef = useRef(permissions);
  const audioUnlockedRef = useRef(false);

  const authUserId = useMemo(
    () => parseInt(user?.userId?.toString() ?? "0"),
    [user?.userId]
  );

  //* connection ref for event handlers
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  //! update refs when state changes
  useEffect(() => {
    permissionsRef.current = permissions;
  }, [permissions]);

  //! audio unlock optimization
  useEffect(() => {
    if (audioUnlockedRef.current) return;

    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;

      const audio = new Audio();
      audio
        .play()
        .then(() => {
          audioUnlockedRef.current = true;
          cleanup();
        })
        .catch(() => {});
    };

    const cleanup = () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return cleanup;
  }, []);

  //* get event handlers
  const eventHandlers = useSignalREvent(
    authUserId,
    permissionsRef,
    connectionRef,
    selectedChatId
  );

  //! connection management with enhanced error handling
  const {
    connection,
    isConnected,
    connectionError,
    connectionMetrics,
    reconnect,
    forceReconnect,
    checkConnection,
  } = useSignalR(authUserId, token ?? "", eventHandlers);

  //! update global connection reference
  useEffect(() => {
    globalConnection = connection;
    connectionRef.current = connection;
  }, [connection]);

  const getConnection = useCallback(() => globalConnection, []);

  //! send message
  const sendMessage = useCallback(
    async (messageData: any) => {
      const isGroup = messageData.type === "group";
      const reqBody = {
        messageId: messageData.messageId,
        userId: parseInt(
          messageData.userId?.toString() ?? authUserId.toString()
        ),
        toUserId: parseInt(messageData.toUserId?.toString() ?? "0"),
        groupId: isGroup ? messageData.groupId : null,
        message: messageData.message || messageData.text,
        type: messageData.type,
        attachments: messageData.attachments || [],
        isApprovalNeeded: Boolean(messageData?.isApprovalNeeded),
        eligibleUsers: messageData.eligibleUsers || [],
        parentMessageId: messageData.parentMessageId || null,
        parentMessageText: messageData.parentMessageText || null,
      };

      const optimisticMessage: IMessage = {
        messageId: messageData.messageId,
        parentMessageId: messageData.parentMessageId || null,
        parentMessageText: messageData.parentMessageText || null,
        date: new Date().toISOString(),
        message: messageData.message || messageData.text,
        senderName: user?.fullName || user?.userName || "",
        toUserId: messageData.toUserId,
        userId: authUserId,
        status: "sending" as const,
        type: messageData.type as "user" | "group",
        isApprovalNeeded: messageData.isApprovalNeeded || false,
        attachments: messageData.attachments || [],
        eligibleUsers: messageData.eligibleUsers || null,
      };

      dispatch(addOptimisticMessage(optimisticMessage));

      if (!checkConnection()) {
        console.warn("Cannot send message: not connected - queuing message");
        dispatch(
          updateMessageStatus({
            messageId: messageData.messageId,
            status: "queued",
          })
        );
        return;
      }

      try {
        await connection?.invoke("SendMessage", reqBody);
        console.log("🚀 ~ useSignalRInvoke ~ reqBody sent:", reqBody);
        dispatch(
          updateMessageStatus({
            messageId: reqBody.messageId,
            status: "sent",
          })
        );
      } catch (error) {
        console.error("Send message error:", error);
        dispatch(
          updateMessageStatus({
            messageId: reqBody.messageId,
            status: "failed",
          })
        );
      }
    },
    [
      connection,
      dispatch,
      checkConnection,
      authUserId,
      user?.fullName,
      user?.userName,
    ]
  );

  //   const setModifyMessage = useCallback(
  //     createSignalRMethod("SetModifyMessage"),
  //     [createSignalRMethod]
  //   );
  //   const notifyTypingStatus = useCallback(
  //     async (
  //       fromUserId: number,
  //       toUserId: number,
  //       isTyping: boolean,
  //       type: "group" | "user",
  //       groupId: string | null = null
  //     ) => {
  //       await createSignalRMethod("SendTyping")(
  //         parseInt(fromUserId.toString()),
  //         parseInt(toUserId.toString()),
  //         isTyping,
  //         type,
  //         groupId
  //       );
  //     },
  //     [createSignalRMethod]
  //   );

  //   const markAsSeen = useCallback(
  //     async (messageId: string, type: string) => {
  //       await createSignalRMethod("MarkAsSeen")(messageId, type);
  //     },
  //     [createSignalRMethod]
  //   );

  //   const markMultipleMessageAsSeen = useCallback(
  //     createSignalRMethod("SetMarkMultipleMessageAsSeen"),
  //     [createSignalRMethod]
  //   );
  //   const approvalDecision = useCallback(
  //     createSignalRMethod("SetApprovalDecision"),
  //     [createSignalRMethod]
  //   );

  //   const receiveApprovedRequest = useCallback(
  //     async (messageId: string, type: string, approverId?: number | null) => {
  //       playSound("/files/message.mp3");
  //       await createSignalRMethod("SendForApprove")(messageId, type, approverId);
  //     },
  //     [createSignalRMethod]
  //   );

  //   const setMessageReaction = useCallback(
  //     createSignalRMethod("SetMessageReaction"),
  //     [createSignalRMethod]
  //   );
  //   const deleteRequest = useCallback(createSignalRMethod("SetDeleteRequest"), [
  //     createSignalRMethod,
  //   ]);
  //   const deleteMessage = useCallback(createSignalRMethod("SetDeleteMessage"), [
  //     createSignalRMethod,
  //   ]);
  //   const cancelDeleteRequest = useCallback(
  //     createSignalRMethod("SetCancelDeleteRequest"),
  //     [createSignalRMethod]
  //   );

  //! memoized return value

  return useMemo(
    () => ({
      connection,
      getConnection,
      selectedUserInfoRef: null,
      isConnected,
      connectionError,
      connectionMetrics,
      reconnect,
      forceReconnect,
      checkConnection,
      sendMessage,
      markMultipleMessageAsSeen: async () => {
        throw new Error("markMultipleMessageAsSeen not implemented");
      },
      receiveApprovedRequest: async () => {
        throw new Error("receiveApprovedRequest not implemented");
      },
      approvalDecision: async () => {
        throw new Error("approvalDecision not implemented");
      },
      notifyTypingStatus: async () => {
        throw new Error("notifyTypingStatus not implemented");
      },
      markAsSeen: async () => {
        throw new Error("markAsSeen not implemented");
      },
      deleteRequest: async () => {
        throw new Error("deleteRequest not implemented");
      },
      deleteMessage: async () => {
        throw new Error("deleteMessage not implemented");
      },
      cancelDeleteRequest: async () => {
        throw new Error("cancelDeleteRequest not implemented");
      },
      setModifyMessage: async () => {
        throw new Error("setModifyMessage not implemented");
      },
      setMessageReaction: async () => {
        throw new Error("setMessageReaction not implemented");
      },
    }),
    [
      connection,
      getConnection,
      isConnected,
      connectionError,
      connectionMetrics,
      sendMessage,
      reconnect,
      forceReconnect,
      checkConnection,
    ]
  );
};

export const getSignalRConnection = () => globalConnection;
