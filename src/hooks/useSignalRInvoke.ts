import { IMessage } from "@/interfaces/chat";
import { ISignalRProps } from "@/interfaces/signalR";
import { buildFileUrl } from "@/lib/utils/file-url-builder";
import { useAppSelector } from "@/redux/selector";
import {
    addOptimisticMessage,
    updateMessageAttachments,
    updateMessageStatus,
} from "@/redux/store/actions";
import { useUploadChatFileMutation } from "@/redux/store/mutations";
import * as signalR from "@microsoft/signalr";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { API_ENDPOINTS } from "../constants/app.constants";
import { useSignalR } from "./useSignalR";
import { useSignalREvent } from "./useSignalREvent";

// handle global connection stable
let globalConnection: signalR.HubConnection | null = null;

// File utility functions
const generateLocalPreview = (file: File): string => {
  return URL.createObjectURL(file);
};

const getFileTypeCategory = (
  file: File
): "image" | "video" | "audio" | "document" => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "document";
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const useSignalRInvoke = (): ISignalRProps => {
  const dispatch = useDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { permissions, selectedChatId } = useAppSelector((state) => state.chat);

  // RTK Query mutation for file upload
  const [uploadChatFile] = useUploadChatFileMutation();

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

  //! enhanced send message with file upload support
  const sendMessage = useCallback(
    async (messageData: any) => {
      const isGroup = messageData.type === "group";
      const { files = [], ...restMessageData } = messageData;

      let attachments: IMessage["attachments"] = [];
      let fileRows: { file: File; fileName: string; uuid: string }[] = [];

      if (files && files.length > 0) {
        fileRows = files.map((file: File) => {
          const ext = file.name.substring(file.name.lastIndexOf("."));
          const fileUuid = uuidv4() + ext;

          const attachment = {
            type: getFileTypeCategory(file),
            filePath: fileUuid,
            fileName: file.name,
            url: generateLocalPreview(file),
            size: formatFileSize(file.size),
          };

          attachments.push(attachment);

          return {
            file,
            fileName: file.name,
            uuid: fileUuid,
          };
        });
      }

      const reqBody = {
        messageId: restMessageData.messageId,
        userId: parseInt(authUserId.toString()),
        toUserId: isGroup
          ? 0
          : parseInt(restMessageData.toUserId?.toString() ?? "0"),
        groupId: isGroup
          ? restMessageData.groupId || restMessageData.userId
          : null,
        message: restMessageData.message || restMessageData.text,
        type: restMessageData.type,
        attachments: attachments,
        isApprovalNeeded: Boolean(restMessageData?.isApprovalNeeded),
        eligibleUsers: restMessageData.eligibleUsers || [],
        parentMessageId: restMessageData.parentMessageId || null,
        parentMessageText: restMessageData.parentMessageText || null,
      };

      const optimisticMessage: IMessage = {
        messageId: restMessageData.messageId,
        parentMessageId: restMessageData.parentMessageId || null,
        parentMessageText: restMessageData.parentMessageText || null,
        date: new Date().toISOString(),
        message: restMessageData.message || restMessageData.text,
        senderName: user?.fullName || user?.userName || "",
        toUserId: reqBody.toUserId,
        userId: authUserId,
        status: "sending" as const,
        type: restMessageData.type as "user" | "group",
        isApprovalNeeded: restMessageData.isApprovalNeeded || false,
        attachments: attachments,
        eligibleUsers: restMessageData.eligibleUsers || null,
      };

      dispatch(addOptimisticMessage(optimisticMessage));
      if (!checkConnection()) {
        console.warn("Cannot send message: not connected - queuing message");
        dispatch(
          updateMessageStatus({
            messageId: restMessageData.messageId,
            status: "queued",
          })
        );
        return;
      }

      try {
        await connection?.invoke("SendMessage", reqBody);

        dispatch(
          updateMessageStatus({
            messageId: restMessageData.messageId,
            status: "sent",
          })
        );

        if (fileRows.length > 0) {
          const formData = new FormData();

          fileRows.forEach((item, index) => {
            console.log(`🚀 ~ Adding file ${index}:`, {
              fileName: item.file.name,
              fileSize: item.file.size,
              fileType: item.file.type,
              uuid: item.uuid
            });
            
            formData.append(`files[${index}].File`, item.file);
            formData.append(`files[${index}].FileName`, item.uuid);
          });

          console.log("🚀 ~ FormData entries:");
          for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
          }

          console.log("🚀 ~ Sending upload request to:", API_ENDPOINTS.UPLOAD_CHAT_ATTACHMENT);

          try {
            const uploadResponse = await uploadChatFile(formData).unwrap();
            console.log("🚀 ~ Upload response:", uploadResponse);
            // API returns result as array, not result.files
            const uploadedFiles = uploadResponse?.result ?? [];

            const updatedAttachments = uploadedFiles.map(
              (uploadedFile: any) => ({
                type: getFileTypeCategory(
                  fileRows.find((fr) => fr.uuid === uploadedFile.fileName)
                    ?.file || new File([], "")
                ),
                filePath: uploadedFile.filePath,
                fileName: uploadedFile.fileName, // Use fileName from response
                url: buildFileUrl(uploadedFile.filePath),
                size: formatFileSize(0), // Size not provided in response
              })
            );

            dispatch(
              updateMessageAttachments({
                messageId: restMessageData.messageId,
                attachments: updatedAttachments,
              })
            );

            console.log(
              "🚀 ~ Files uploaded successfully:",
              updatedAttachments
            );
          } catch (uploadError) {
            console.error("File upload failed:", uploadError);
          }
        }
      } catch (error) {
        console.error("Send message error:", error);
        dispatch(
          updateMessageStatus({
            messageId: restMessageData.messageId,
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
