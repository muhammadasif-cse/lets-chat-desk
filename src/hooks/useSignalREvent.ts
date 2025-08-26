import { IChatItem, IMessage } from "@/interfaces/chat";
import { useAppSelector } from "@/redux/selector";
import {
  addOptimisticMessage,
  addOrUpdateRecentUser,
  removeMessage,
  setTypingStatus,
  updateMessage,
  updateMessageApproval,
  updateMessageStatus,
} from "@/redux/store/actions";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import notificationManager from "../lib/notification-manager";

export const useSignalREvent = (
  authUserId: number,
  permissionsRef: any,
  connectionRef?: React.MutableRefObject<any>,
  signalRFunctions?: {
    markAsSeen: (messageId: string, type: string) => Promise<void>;
    markMultipleMessageAsSeen: (...args: any[]) => Promise<boolean>;
  }
) => {
  const dispatch = useDispatch();
  const { recentUsers, selectedChatId } = useAppSelector((state) => state.chat);
  const processedMessageIds = useRef(new Set<string>());
  const processedApprovalIds = useRef(new Set<string>());
  const processedReplyIds = useRef(new Set<string>());

  const clearOldEntries = useCallback(() => {
    if (processedMessageIds.current.size > 500) {
      const entries = Array.from(processedMessageIds.current);
      processedMessageIds.current = new Set(entries.slice(-250));
      console.log("🧹 Cleaned message IDs cache");
    }
    if (processedApprovalIds.current.size > 500) {
      const entries = Array.from(processedApprovalIds.current);
      processedApprovalIds.current = new Set(entries.slice(-250));
      console.log("🧹 Cleaned approval IDs cache");
    }
    if (processedReplyIds.current.size > 500) {
      const entries = Array.from(processedReplyIds.current);
      processedReplyIds.current = new Set(entries.slice(-250));
      console.log("🧹 Cleaned reply IDs cache");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      clearOldEntries();
      console.log("🧹 Periodic cleanup completed");
    }, 2 * 60 * 1000); // 2 minutes for more frequent cleanup

    return () => clearInterval(interval);
  }, [clearOldEntries]);

  //* receive messages
  const receiveMessage = useCallback(
    async (res: any) => {
      if (!res || !res.messageId) {
        console.warn("Invalid message received:", res);
        return;
      }
      
      // Enhanced deduplication with message content check
      const messageKey = `${res.messageId}_${res.message || ''}_${res.date || ''}`;
      if (processedMessageIds.current.has(messageKey)) {
        console.log("Duplicate message detected, skipping:", res.messageId);
        return;
      }
      processedMessageIds.current.add(messageKey);

      const chatId = res.type === "group" 
        ? res.groupId 
        : (res.userId === authUserId ? res.toUserId : res.userId).toString();
      const isOwnMessage =
        res.userId === authUserId || res.senderId === authUserId;

      const messageForChat: IMessage = {
        messageId: res.messageId,
        parentMessageId: res.parentMessageId || null,
        parentMessageText: res.parentMessageText || null,
        date: res.date || new Date().toISOString(),
        message: res.message || "",
        senderName: res.userName || "",
        toUserId: res.toUserId || 0,
        userId: res.userId,
        status: "sent",
        type: res.type || "user",
        isApprovalNeeded: res.isApprovalNeeded || false,
        isApproved: res.isApproved || false,
        isDeleteRequest: res.isDeleteRequest || false,
        deleteRequestedAt: res.deleteRequestedAt || null,
        isRejected: res.isRejected || false,
        isNotification: res.isNotification || false,
        eligibleUsers: res.eligibleUsers || null,
        attachments: res.attachments || [],
      };

      if (chatId === selectedChatId) {
        console.log("📨 Adding message to current chat:", messageForChat);
        dispatch(addOptimisticMessage(messageForChat));
        
        if (!isOwnMessage && signalRFunctions?.markAsSeen) {
          console.log("🔄 Auto-marking message as seen for current chat:", res.messageId);
          signalRFunctions.markAsSeen(res.messageId, "Message").catch((error) => {
            console.error("❌ Failed to mark message as seen:", error);
          });
        }
      }

      const existingUser = recentUsers.find((user) => user.id === chatId);
      let newUnreadCount = 0;
      
      if (!isOwnMessage) {
        if (chatId === selectedChatId) {
          newUnreadCount = 0;
        } else {
          const previousCount = existingUser?.unreadCount || 0;
          newUnreadCount = previousCount + 1;
        }
      } 

      const recentUserUpdate: IChatItem = {
        id: chatId,
        name: res.userName || existingUser?.name || "",
        photo: res.photo || existingUser?.photo || "",
        description: res.description || existingUser?.description || "",
        type: res.type || "user",
        lastMessage: res.message || "",
        lastMessageId: res.messageId || "",
        lastMessageDate: res.date || new Date().toISOString(),
        unreadCount: newUnreadCount,
        isAdmin: res.isAdmin !== undefined ? res.isAdmin : (existingUser?.isAdmin || false),
        isEditGroupSettings: res.isEditGroupSettings !== undefined ? res.isEditGroupSettings : (existingUser?.isEditGroupSettings || false),
        isSendMessages: res.isSendMessages !== undefined ? res.isSendMessages : (existingUser?.isSendMessages ?? true),
        isAddMembers: res.isAddMembers !== undefined ? res.isAddMembers : (existingUser?.isAddMembers || false),
        hasDeleteRequest: res.hasDeleteRequest !== undefined ? res.hasDeleteRequest : (existingUser?.hasDeleteRequest || false),
      };
      dispatch(addOrUpdateRecentUser(recentUserUpdate));

      if (!isOwnMessage) {
        try {
          const isGroup = res.type === "group";
          if (isGroup) {
            await notificationManager.showMessageNotification(
              res.userName || "Someone",
              res.message || "New message",
              true,
              res.groupName || "Group Chat"
            );
          } else {
            await notificationManager.showMessageNotification(
              res.userName || "Someone",
              res.message || "New message",
              false
            );
          }
        } catch (error) {
          console.error("Failed to show notification:", error);
        }
      }
    },
    [authUserId, dispatch, selectedChatId, recentUsers, signalRFunctions]
  );

  //* typing status handler
  const typingStatus = useCallback(
    (data: any) => {
      console.log("🔄 Typing status received:", data);
      const { fromUserId, toUserId, isTyping, userName, groupId, type } = data;
      
      if (fromUserId === authUserId) {
        console.log("Ignoring own typing status");
        return;
      }
      
      let isRelevantChat = false;
      let key = "left";

      if (type === "group" && groupId) {
        isRelevantChat = groupId === selectedChatId;
        key = "left";
      } else {
        isRelevantChat = fromUserId?.toString() === selectedChatId;
        key = "left";
      }
      
      if (isRelevantChat) {
        dispatch(
          setTypingStatus({
            senderId: fromUserId,
            receiverId: toUserId,
            isTyping,
            username: userName || "",
            groupId: groupId || null,
            type,
            key,
          })
        );
      }
    },
    [dispatch, selectedChatId, authUserId]
  );

  //* mark seen multiple message
  const markAsSeen = useCallback(
    (data: { messageId: string; isSeen: boolean }) => {
      dispatch(
        updateMessageStatus({
          messageId: data.messageId,
          status: data.isSeen ? "seen" : "delivered",
        })
      );
    },
    [dispatch]
  );

  const markAsSeenMultiple = useCallback(
    (data: any) => {
      console.log("📥 Seen all messages:", data);
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((msg: any) => {
          dispatch(
            updateMessageStatus({
              messageId: msg.messageId,
              status: "seen",
            }),
          );
        });
      }
    },
    [dispatch],
  );

  //* approval decision handler with professional deduplication
  const approvalDecision = useCallback(
    ({
      messageId,
      isApproved,
      isRejected,
      replyMessage,
      isApprovalNeeded,
      isDeleteRequest,
    }: any) => {
      console.log("📥 Approval decision received:", {
        messageId,
        isApproved,
        isRejected,
        replyMessage,
        isApprovalNeeded,
        isDeleteRequest,
      });

      // Update the original message approval status
      dispatch(
        updateMessageApproval({
          messageId,
          isApproved: Boolean(isApproved),
          isRejected: Boolean(isRejected),
          isApprovalNeeded:
            isApprovalNeeded !== undefined
              ? Boolean(isApprovalNeeded)
              : false, // Set to false when decision is made
          isDeleteRequest:
            isDeleteRequest !== undefined
              ? Boolean(isDeleteRequest)
              : undefined,
        })
      );

      // Add reply message if approval/rejection happened
      if (replyMessage && (isApproved === true || isRejected === true)) {
        const replyKey = `${messageId}_reply_${
          isApproved ? "approved" : "rejected"
        }`;
        if (!processedReplyIds.current.has(replyKey)) {
          processedReplyIds.current.add(replyKey);
          console.log("📥 Adding reply message:", replyMessage);

          // Create a proper reply message from the response
          const replyMessageForChat: IMessage = {
            messageId: replyMessage.id,
            parentMessageId: replyMessage.parentMessageId || messageId,
            parentMessageText: replyMessage.parentMessageText || null,
            date: replyMessage.createdAt || new Date().toISOString(),
            message: replyMessage.message || "",
            senderName: replyMessage.senderName || "",
            toUserId: 0,
            userId: replyMessage.senderId || authUserId,
            status: "sent",
            type: replyMessage.type || "group",
            isApprovalNeeded: false,
            isApproved: false,
            isDeleteRequest: false,
            deleteRequestedAt: null,
            isRejected: false,
            isNotification: true,
            eligibleUsers: null,
            attachments: [],
          };

          dispatch(addOptimisticMessage(replyMessageForChat));
        } else {
          console.log("Duplicate reply message detected, skipping:", replyKey);
        }
      }
    },
    [dispatch, authUserId]
  );

  //* receive approved request handler with deduplication
  const handleReceiveApprovedRequest = useCallback(
    (data: any) => {
      console.log("📥 SERVER CONFIRMED: Received approved request from server:", data);
      console.log("📥 This means the backend has processed our approval request");

      const requestKey = `${data?.messageId}_approve_request`;
      if (processedApprovalIds.current.has(requestKey)) {
        console.log(
          "Duplicate approval request detected, skipping:",
          requestKey
        );
        return;
      }
      processedApprovalIds.current.add(requestKey);

      console.log("📥 Updating message approval state for:", data?.messageId);
      
      // This confirms the server has received our request
      dispatch(
        updateMessageApproval({
          messageId: data?.messageId,
          isApprovalNeeded: true,
        })
      );
    },
    [dispatch]
  );

  //* delete request handler
  const handleReceiveDeleteRequest = useCallback(
    (data: any) => {
      console.log("📥 Received delete request:", data);
      dispatch(
        updateMessageApproval({
          messageId: data.messageId,
          isDeleteRequest: true,
        })
      );
    },
    [dispatch]
  );

  //* delete message handler
  const handleDeleteMessage = useCallback(
    (data: any) => {
      console.log("📥 Delete message:", data);
      dispatch(removeMessage(data.messageId));
    },
    [dispatch]
  );

  //* cancel delete request handler
  const handleCancelDeleteRequest = useCallback(
    (data: any) => {
      console.log("📥 Cancel delete request:", data);
      dispatch(
        updateMessageApproval({
          messageId: data.messageId,
          isDeleteRequest: false,
        })
      );
    },
    [dispatch]
  );

  //* message modification handler
  const handleModifyMessage = useCallback(
    (data: { messageId: string; newMessage: string }) => {
      console.log("📥 Modify message:", data);
      dispatch(
        updateMessage({
          messageId: data.messageId,
          newMessage: data.newMessage,
        })
      );
    },
    [dispatch]
  );

  //   //! seen all messages handler
  //   const handleSeenAllMessage = useCallback(
  //     (data: any) => {
  //       console.log("📥 Seen all messages:", data);
  //       if (Array.isArray(data) && data.length > 0) {
  //         data.forEach((msg: any) => {
  //           dispatch(
  //             updateMessageStatus({
  //               messageId: msg.messageId,
  //               status: "seen",
  //             })
  //           );
  //         });
  //       }
  //     },
  //     [dispatch]
  //   );

  //   //! online status handler
  //   const handleOnlineStatus = useCallback(
  //     (status: any) => {
  //       if (
  //         selectedUserInfoRef.current?.id?.toString() ===
  //         status?.userId?.toString()
  //       ) {
  //         dispatch(
  //           setSelectedUserInfo({
  //             ...selectedUserInfoRef.current,
  //             isOnline: status?.isOnline ?? false,
  //             lastOnline: status?.lastOnline ?? null,
  //           })
  //         );
  //       }
  //     },
  //     [dispatch]
  //   );

  //   //! message modification handler
  //   const handleModifyMessage = useCallback(
  //     (data: { messageId: string; newMessage: string }) => {
  //       dispatch(
  //         updateMessage({
  //           messageId: data.messageId,
  //           newMessage: data.newMessage,
  //         })
  //       );
  //       dispatch(
  //         updateLastMessage({
  //           messageId: data.messageId,
  //           newMessage: data.newMessage,
  //         })
  //       );
  //     },
  //     [dispatch]
  //   );

  //   //! group-related handlers
  //   const handleGroupCreated = useCallback(
  //     (data: any) => {
  //       console.log("📥 Group Created:", data);

  //       playSound(SOUND_FILES.MESSAGE);
  //       const isAdmin = authUserId === data.userId;
  //       let found = false;
  //       const updatePermissions = permissionsRef.current.map((perm: any) => {
  //         if (perm.id === data.groupId.toString()) {
  //           found = true;
  //           return {
  //             ...perm,
  //             isAdmin: isAdmin ? true : data.isAdmin,
  //             isEditGroupSettings: isAdmin ? true : data.isEditGroupSettings,
  //             isSendMessages: isAdmin ? true : data.isSendMessages,
  //             isAddMembers: isAdmin ? true : data.isAddMembers,
  //             hasDeleteRequest: false,
  //           };
  //         }
  //         return perm;
  //       });
  //       if (!found) {
  //         updatePermissions.push({
  //           id: data.groupId.toString(),
  //           isAdmin: isAdmin ? true : data.isAdmin,
  //           isEditGroupSettings: isAdmin ? true : data.isEditGroupSettings,
  //           isSendMessages: isAdmin ? true : data.isSendMessages,
  //           isAddMembers: isAdmin ? true : data.isAddMembers,
  //           hasDeleteRequest: false,
  //         });
  //       }
  //       dispatch(setPermission(updatePermissions));
  //       dispatch(
  //         updateRecentChatUsers({
  //           id: data.groupId,
  //           type: "group",
  //           name: data.groupName,
  //           lastMessage: data.message,
  //           message: data.message,
  //         })
  //       );
  //     },
  //     [authUserId, dispatch]
  //   );

  //   //! handle remove from group
  //   const handleRemoveFromGroup = useCallback(
  //     (data: any) => {
  //       console.log("📥 Remove From Group:", data);
  //       playSound(SOUND_FILES.MESSAGE);

  //       if (data.userId === authUserId) {
  //         dispatch(
  //           removeRecentChatUser({
  //             id: data.groupId,
  //             type: "group",
  //             name: data.groupName,
  //             lastMessage: data.message,
  //             message: data.message,
  //           })
  //         );
  //       }

  //       // handle notification message for current selected chat
  //       if (data.groupId === selectedUserInfoRef.current.id) {
  //         const tempId = uuidv4();
  //         dispatch(
  //           addMessageAndReorder({
  //             message: {
  //               messageId: tempId,
  //               message: data.message,
  //               isApprovalNeeded: false,
  //               userId: data.userId,
  //               isApproved: false,
  //               isNotification: true,
  //               isRejected: false,
  //               type: "group",
  //               date: new Date().toISOString(),
  //               status: "sent",
  //             },
  //             recentUser: {
  //               id: data.groupId,
  //               type: "group",
  //               name: data.groupName,
  //               lastMessage: data.message,
  //               message: data.message,
  //               date: new Date().toISOString(),
  //             },
  //           })
  //         );
  //       }
  //     },
  //     [authUserId, dispatch]
  //   );

  //   //! handle added user into group
  //   const handleAddedUserIntoGroup = useCallback(
  //     (data: any) => {
  //       console.log("📥 Added User Into Group:", data);
  //       playSound(SOUND_FILES.MESSAGE);

  //       // Update group permissions for current user
  //       let found = false;
  //       const updatePermissions = permissionsRef.current.map((perm: any) => {
  //         if (perm.id === data.groupId.toString()) {
  //           found = true;
  //           return {
  //             ...perm,
  //             isAddMembers: data.isAddMembers,
  //             isAdmin: data.isAdmin,
  //             isEditGroupSettings: data.isEditGroupSettings,
  //             isSendMessages: data.isSendMessages,
  //           };
  //         }
  //         return perm;
  //       });

  //       if (!found) {
  //         updatePermissions.push({
  //           id: data.groupId.toString(),
  //           isAdmin: data.isAdmin,
  //           isEditGroupSettings: data.isEditGroupSettings,
  //           isSendMessages: data.isSendMessages,
  //           isAddMembers: data.isAddMembers,
  //           hasDeleteRequest: false,
  //         });
  //       }
  //       dispatch(setPermission(updatePermissions));

  //       // Update recent chat users
  //       dispatch(
  //         updateRecentChatUsers({
  //           id: data.groupId,
  //           type: "group",
  //           name: data.groupName,
  //           lastMessage: data.message,
  //           message: data.message,
  //           isAddMembers: data.isAddMembers,
  //           isAdmin: data.isAdmin,
  //           isEditGroupSettings: data.isEditGroupSettings,
  //           isSendMessages: data.isSendMessages,
  //         })
  //       );

  //       // Add notification message
  //       const tempId = uuidv4();
  //       dispatch(
  //         addMessageAndReorder({
  //           message: {
  //             messageId: tempId,
  //             message: data.message,
  //             isApprovalNeeded: false,
  //             userId: data.userId,
  //             isApproved: false,
  //             isNotification: true,
  //             isRejected: false,
  //             type: "group",
  //             date: new Date().toISOString(),
  //             status: "sent",
  //           },
  //           recentUser: {
  //             id: data.groupId,
  //             type: "group",
  //             name: data.groupName,
  //             lastMessage: data.message,
  //             message: data.message,
  //             date: new Date().toISOString(),
  //           },
  //         })
  //       );
  //     },
  //     [dispatch]
  //   );

  //   //! handle change permission
  //   const handleChangePermission = useCallback(
  //     (data: any) => {
  //       console.log("📥 Change Permission:", data);
  //       playSound(SOUND_FILES.MESSAGE);

  //       if (authUserId === data.userId) {
  //         let found = false;
  //         const updatePermissions = permissionsRef.current.map((perm: any) => {
  //           if (perm.id === data.groupId.toString()) {
  //             found = true;
  //             return {
  //               ...perm,
  //               isAddMembers: data.isAddMembers,
  //               isEditGroupSettings: data.isEditGroupSettings,
  //               isSendMessages: data.isSendMessages,
  //               isAdmin: data.isAdmin,
  //             };
  //           }
  //           return perm;
  //         });

  //         if (!found) {
  //           updatePermissions.push({
  //             id: data.groupId.toString(),
  //             isAdmin: data.isAdmin,
  //             isEditGroupSettings: data.isEditGroupSettings,
  //             isSendMessages: data.isSendMessages,
  //             isAddMembers: data.isAddMembers,
  //             hasDeleteRequest: false,
  //           });
  //         }
  //         dispatch(setPermission(updatePermissions));

  //         dispatch(
  //           updateRecentChatUsers({
  //             id: data.groupId,
  //             type: "group",
  //             name: data.groupName,
  //             lastMessage: data.message,
  //             message: data.message,
  //             isAddMembers: data.isAddMembers,
  //             isEditGroupSettings: data.isEditGroupSettings,
  //             isSendMessages: data.isSendMessages,
  //             isAdmin: data.isAdmin,
  //           })
  //         );
  //       }
  //     },
  //     [authUserId, dispatch]
  //   );

  //   //! handle group updated
  //   const handleGroupUpdated = useCallback(
  //     (data: any) => {
  //       console.log("📥 Group Updated:", data);
  //       playSound(SOUND_FILES.MESSAGE);

  //       const recentUsers = recentChatUsersRef.current as IRecentChatUsers[];
  //       const currentChat = recentUsers.find((user) => user.id === data.groupId);

  //       dispatch(
  //         updateRecentChatUsers({
  //           id: data.groupId,
  //           type: "group",
  //           name: data.groupName,
  //           lastMessage: data.message,
  //           photo: data.photo ?? "",
  //           message: data.message,
  //           isAddMembers: currentChat?.isAddMembers,
  //           isEditGroupSettings: currentChat?.isEditGroupSettings,
  //           isSendMessages: currentChat?.isSendMessages,
  //           isAdmin: currentChat?.isAdmin,
  //         })
  //       );
  //     },
  //     [dispatch]
  //   );

  //   //! message reaction handler with deduplication
  //   const handleMessageReaction = useCallback(
  //     (data: any) => {
  //       console.log("📥 Received reaction request:", data);

  //       const reactionKey = `${data.messageId}_reactions_${
  //         data.senderId
  //       }_${Date.now()}`;
  //       if (processedMessageIds.current.has(`${data.messageId}_reactions`)) {
  //         const timeDiff =
  //           Date.now() -
  //           (processedMessageIds.current.has(reactionKey) ? 0 : 1000);
  //         if (timeDiff < 500) {
  //           console.log(
  //             "Duplicate reaction detected (too fast), skipping:",
  //             reactionKey
  //           );
  //           return;
  //         }
  //       }
  //       processedMessageIds.current.add(`${data.messageId}_reactions`);

  //       if (data.senderId == authUserId) {
  //         playSound(SOUND_FILES.MESSAGE);
  //       }
  //       dispatch(
  //         updateMessageReactions({
  //           messageId: data.messageId,
  //           reactions: data.reactions,
  //         })
  //       );
  //     },
  //     [dispatch, authUserId]
  //   );

  //   //! group delete request handler
  //   const handleGroupDeleteRequest = useCallback(
  //     (data: any) => {
  //       console.log("📥 Received group delete request:", data);
  //       playSound(SOUND_FILES.MESSAGE);
  //       const updatePermissions = permissionsRef.current.map((perm: any) => {
  //         if (perm.id === data.groupId.toString()) {
  //           return { ...perm, hasDeleteRequest: true };
  //         }
  //         return perm;
  //       });
  //       dispatch(setPermission(updatePermissions));
  //     },
  //     [dispatch]
  //   );

  //   //! delete group confirmation handler
  //   const handleDeleteGroupConfirm = useCallback(
  //     (data: any) => {
  //       console.log("📥 Delete group confirmation:", data);
  //       playSound(SOUND_FILES.MESSAGE);
  //       const updatePermissions = permissionsRef.current.map((perm: any) => {
  //         if (perm.id === data.groupId.toString()) {
  //           return { ...perm, hasDeleteRequest: false };
  //         }
  //         return perm;
  //       });
  //       dispatch(setPermission(updatePermissions));
  //       dispatch(
  //         removeRecentChatUser({
  //           id: data.groupId,
  //           type: "group",
  //         })
  //       );
  //     },
  //     [dispatch]
  //   );

  //! memoized event handlers object
  const signalREvents = useMemo(
    () => ({
      OnReceiveMessage: receiveMessage,
      OnReceiveTyping: typingStatus,
      OnSeenAllMessage: markAsSeenMultiple,
      OnMessageSeen: markAsSeen,
      OnApprovalDecision: approvalDecision,
      OnReceiveApprovedRequest: handleReceiveApprovedRequest,
      OnReceiveDeleteRequest: handleReceiveDeleteRequest,
      OnDeleteMessage: handleDeleteMessage,
      OnCancelDeleteRequest: handleCancelDeleteRequest,
      OnModifyMessage: handleModifyMessage,
    }),
    [
      receiveMessage,
      typingStatus,
      selectedChatId,
      authUserId,
      markAsSeen,
      markAsSeenMultiple,
      approvalDecision,
      handleReceiveApprovedRequest,
      handleReceiveDeleteRequest,
      handleDeleteMessage,
      handleCancelDeleteRequest,
      handleModifyMessage,
    ]
  );

  return signalREvents;
};
