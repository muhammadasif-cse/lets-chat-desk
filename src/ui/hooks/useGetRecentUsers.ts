import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { IRecentUser } from "../../interfaces/user";
import { useAppSelector } from "../../redux/selector";
import { AppDispatch } from "../../redux/store";
import { setPermissions, setRecentUsers } from "../../redux/store/actions";
import { useGetRecentUsersMutation } from "../../redux/store/mutations";
import { TChatPermissions } from "../../redux/store/state.interface";
import { TResponse } from "../types/api-response.type";

export const useGetRecentUsers = (): {
  handleRecentUsers: () => Promise<void>;
  isLoading: boolean;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const [getRecentUsers, { isLoading }] = useGetRecentUsersMutation();
  const { recentUsers } = useAppSelector((state) => state.chat);
  const hasFetchedRef = useRef(false);

  const handleRecentUsers = useCallback(async () => {
    if (hasFetchedRef.current || isLoading || recentUsers.length > 0) {
      return;
    }

    hasFetchedRef.current = true;

    try {
      const response = await getRecentUsers("").unwrap();
      const { code, result } = response as TResponse<IRecentUser>;

      if (code === 200 && Array.isArray(result)) {
        const permissions: TChatPermissions[] = result.map(
          (item: IRecentUser) => ({
            id: item.id,
            isEditGroupSettings: item.isEditGroupSettings,
            isSendMessages: item.isSendMessages,
            isAddMembers: item.isAddMembers,
            isAdmin: item.isAdmin,
            hasDeleteRequest: item.hasDeleteRequest,
          })
        );

        dispatch(setPermissions(permissions));
        dispatch(setRecentUsers(result as IRecentUser[]));
      }
    } catch (error) {
      hasFetchedRef.current = false;
      toast.error(
        (error as any)?.data?.message ||
          (error as any).message ||
          "Something went wrong"
      );
    }
  }, [dispatch, isLoading, recentUsers.length]);

  return { handleRecentUsers, isLoading };
};
