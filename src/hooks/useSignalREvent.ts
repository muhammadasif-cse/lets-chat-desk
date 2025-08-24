import { IChatItem } from "@/interfaces/chat";
import { useAppSelector } from "@/redux/selector";
import { setRecentUsers } from "@/redux/store/actions";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";

export const useSignalREvent = (
  authUserId: number,
  permissionsRef: any,
  connectionRef?: React.MutableRefObject<any>,
  selectedChatId?: string | null
) => {
  const dispatch = useDispatch();
  const { recentUsers } = useAppSelector((state) => state.chat);
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
      console.log("🚀 ~ useSignalREvent ~ receiveMessage:", res);

      if (!res || !res.messageId) {
        console.warn("Invalid message received:", res);
        return;
      }
      if (processedMessageIds.current.has(res.messageId)) {
        console.log("Duplicate message detected, skipping:", res.messageId);
        return;
      }
      processedMessageIds.current.add(res.messageId);

      const chatId = res.type === "group" ? res.groupId : res.userId.toString();
      const chatName = res.type === "group" ? res.groupName : res.senderName;

      const updatedRecentUsers = [...recentUsers];
      const existingUserIndex = updatedRecentUsers.findIndex(
        (user) => user.id === chatId
      );

      const recentUserUpdate: IChatItem = {
        id: chatId,
        name: chatName || "",
        photo: res.photo || "",
        description: res.description || "",
        type: res.type || "user",
        lastMessage: res.message || "",
        lastMessageId: res.messageId || "",
        lastMessageDate: res.date || new Date().toISOString(),
        unreadCount:
          existingUserIndex >= 0
            ? updatedRecentUsers[existingUserIndex].unreadCount + 1
            : 1,
        isAdmin: res.isAdmin || false,
        isEditGroupSettings: res.isEditGroupSettings || false,
        isSendMessages: res.isSendMessages || true,
        isAddMembers: res.isAddMembers || false,
        hasDeleteRequest: res.hasDeleteRequest || false,
      };

      if (existingUserIndex >= 0) {
        updatedRecentUsers[existingUserIndex] = recentUserUpdate;
        const [updatedUser] = updatedRecentUsers.splice(existingUserIndex, 1);
        updatedRecentUsers.unshift(updatedUser);
      } else {
        updatedRecentUsers.unshift(recentUserUpdate);
      }

      dispatch(setRecentUsers(updatedRecentUsers));
    },
    [authUserId, dispatch, selectedChatId, recentUsers]
  );

  //   //! typing status handler
  //   const handleTypingStatus = useCallback(
  //     (data: any) => {
  //       const { fromUserId, toUserId, isTyping, userName, groupId, type } = data;
  //       const currentSelected = selectedUserInfoRef.current;
  //       const key =
  //         fromUserId?.toString() === currentSelected?.id?.toString()
  //           ? "both"
  //           : "left";

  //       dispatch(
  //         setTypingStatus({
  //           senderId: fromUserId,
  //           receiverId: toUserId,
  //           isTyping,
  //           username: userName || "",
  //           groupId: groupId || null,
  //           type,
  //           key,
  //         })
  //       );
  //     },
  //     [dispatch]
  //   );

  //   //! message seen handler
  //   const handleMarkSeen = useCallback(
  //     (data: { messageId: string; isSeen: boolean }) => {
  //       dispatch(
  //         updateMessageStatus({
  //           messageId: data.messageId,
  //           status: data.isSeen ? "seen" : "delivered",
  //         })
  //       );
  //     },
  //     [dispatch]
  //   );

  //   //! approval decision handler with professional deduplication
  //   const handleApprovalDecision = useCallback(
  //     ({
  //       messageId,
  //       isApproved,
  //       isRejected,
  //       replyMessage,
  //       isApprovalNeeded,
  //       isDeleteRequest,
  //     }: any) => {
  //       console.log("📥 Approval Decision:", {
  //         messageId,
  //         isApproved,
  //         isRejected,
  //         isApprovalNeeded,
  //         isDeleteRequest,
  //       });

  //       const approvalKey = `${messageId}_approval_${isApproved}_${isRejected}`;
  //       if (processedApprovalIds.current.has(approvalKey)) {
  //         console.log(
  //           "Duplicate approval decision detected, skipping:",
  //           approvalKey
  //         );
  //         return;
  //       }
  //       processedApprovalIds.current.add(approvalKey);

  //       playSound(SOUND_FILES.MESSAGE);

  //       dispatch(
  //         updateMessageApproval({
  //           messageId,
  //           isApproved: Boolean(isApproved),
  //           isRejected: Boolean(isRejected),
  //           isApprovalNeeded:
  //             isApprovalNeeded !== undefined
  //               ? Boolean(isApprovalNeeded)
  //               : undefined,
  //           isDeleteRequest:
  //             isDeleteRequest !== undefined
  //               ? Boolean(isDeleteRequest)
  //               : undefined,
  //         })
  //       );

  //       if (replyMessage && (isApproved === true || isRejected === true)) {
  //         const replyKey = `${messageId}_reply_${
  //           isApproved ? "approved" : "rejected"
  //         }`;
  //         if (!processedReplyIds.current.has(replyKey)) {
  //           processedReplyIds.current.add(replyKey);
  //           console.log("📥 Adding reply message:", replyMessage);

  //           dispatch(
  //             addReplyMessage({
  //               message: {
  //                 ...replyMessage,
  //                 messageId: replyMessage.messageId || `reply_${Date.now()}`,
  //                 userId: replyMessage?.senderId,
  //                 toUserId: replyMessage?.receiverId,
  //                 date: new Date().toISOString(),
  //                 status: "sent" as const,
  //               },
  //               parentMessageId: messageId,
  //               parentMessageText: replyMessage?.parentMessageText || "",
  //             })
  //           );
  //         } else {
  //           console.log("Duplicate reply message detected, skipping:", replyKey);
  //         }
  //       }
  //     },
  //     [dispatch]
  //   );

  //   //! receive approved request handler with deduplication
  //   const handleReceiveApprovedRequest = useCallback(
  //     (data: any) => {
  //       console.log("📥 Received approved request:", data);

  //       const requestKey = `${data?.messageId}_approve_request`;
  //       if (processedApprovalIds.current.has(requestKey)) {
  //         console.log(
  //           "Duplicate approval request detected, skipping:",
  //           requestKey
  //         );
  //         return;
  //       }
  //       processedApprovalIds.current.add(requestKey);

  //       playSound(SOUND_FILES.MESSAGE);

  //       dispatch(
  //         updateMessageApproval({
  //           messageId: data?.messageId,
  //           isApprovalNeeded: true,
  //         })
  //       );
  //     },
  //     [dispatch]
  //   );

  //   //! delete request handler
  //   const handleReceiveDeleteRequest = useCallback(
  //     (data: any) => {
  //       playSound(SOUND_FILES.MESSAGE);
  //       dispatch(
  //         updateMessageApproval({
  //           messageId: data.messageId,
  //           isDeleteRequest: true,
  //         })
  //       );
  //     },
  //     [dispatch]
  //   );

  //   //! delete message handler
  //   const handleDeleteMessage = useCallback(
  //     (data: any) => {
  //       playSound(SOUND_FILES.MESSAGE);
  //       dispatch(removeMessage(data.messageId));
  //     },
  //     [dispatch]
  //   );

  //   //! cancel delete request handler
  //   const handleCancelDeleteRequest = useCallback(
  //     (data: any) => {
  //       playSound(SOUND_FILES.MESSAGE);
  //       dispatch(
  //         updateMessageApproval({
  //           messageId: data.messageId,
  //           isDeleteRequest: false,
  //         })
  //       );
  //     },
  //     [dispatch]
  //   );

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
      //   OnReceiveTyping: handleTypingStatus,
      //   OnSeenMessage: handleMarkSeen,
      //   OnSeenAllMessage: handleSeenAllMessage,
      //   OnApprovalDecision: handleApprovalDecision,
      //   OnReceiveApprovedRequest: handleReceiveApprovedRequest,
      //   OnReceiveDeleteRequest: handleReceiveDeleteRequest,
      //   OnDeleteMessage: handleDeleteMessage,
      //   OnCancelDeleteRequest: handleCancelDeleteRequest,
      //   UserOnlineStatus: handleOnlineStatus,
      //   OnModifyMessage: handleModifyMessage,
      //   OnGroupCreated: handleGroupCreated,
      //   OnRemoveFromGroup: handleRemoveFromGroup,
      //   OnAddedUserIntoGroup: handleAddedUserIntoGroup,
      //   OnChangePermission: handleChangePermission,
      //   OnGroupUpdated: handleGroupUpdated,
      //   OnMessageReaction: handleMessageReaction,
      //   OnGroupDeleteRequested: handleGroupDeleteRequest,
      //   OnDeleteGroup: handleDeleteGroupConfirm,
    }),
    [
      receiveMessage,
      //   handleTypingStatus,
      //   handleMarkSeen,
      //   handleSeenAllMessage,
      //   handleApprovalDecision,
      //   handleReceiveApprovedRequest,
      //   handleReceiveDeleteRequest,
      //   handleDeleteMessage,
      //   handleCancelDeleteRequest,
      //   handleOnlineStatus,
      //   handleModifyMessage,
      //   handleGroupCreated,
      //   handleRemoveFromGroup,
      //   handleAddedUserIntoGroup,
      //   handleChangePermission,
      //   handleGroupUpdated,
      //   handleMessageReaction,
      //   handleGroupDeleteRequest,
      //   handleDeleteGroupConfirm,
    ]
  );

  return signalREvents;
};
