import { useCallback, useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import { useSession } from "@/features/auth";
import { postsService } from "../services/postsService";
import { PostGroupDetailMinimal } from "../types";
import { postKeys } from "./usePostsQueries";

export type GroupMembershipStatus = "leader" | "member" | "pending" | "none";

/**
 * H.U 2.1 — Estado del usuario actual frente a cada grupo del feed.
 *
 * Consulta GET /groups/:groupId mediante TanStack Query (una entrada por grupo distinto)
 * y deriva el estado ("leader" | "member" | "pending" | "none").
 */
export function useGroupStatuses(groupIds: string[]) {
  const { user, isAdmin } = useSession();
  const userId = user?.id || "";
  const queryClient = useQueryClient();

  const uniqueIds = useMemo(
    () => (isAdmin || !userId ? [] : [...new Set(groupIds)].sort()),
    [groupIds, isAdmin, userId],
  );

  const queries = useQueries({
    queries: uniqueIds.map((groupId) => ({
      queryKey: postKeys.groupDetail(userId, groupId),
      queryFn: () => postsService.getGroupDetail(groupId),
      enabled: Boolean(userId) && !isAdmin && Boolean(groupId),
      staleTime: 15_000,
      retry: false,
    })),
  });

  const statuses = useMemo(() => {
    const next: Record<string, GroupMembershipStatus> = {};
    uniqueIds.forEach((groupId, index) => {
      const group = queries[index]?.data;
      if (!group) return;
      next[groupId] =
        group.myRole ?? (group.pendingRequest ? "pending" : "none");
    });
    return next;
  }, [uniqueIds, queries]);

  const loading = queries.some((q) => q.isPending);

  /** Marca un grupo como "pending" en caché después de enviar la solicitud con éxito. */
  const markPending = useCallback(
    (groupId: string) => {
      if (!userId) return;
      queryClient.setQueryData<PostGroupDetailMinimal>(
        postKeys.groupDetail(userId, groupId),
        (prev) =>
          prev
            ? { ...prev, pendingRequest: true }
            : { id: groupId, myRole: null, pendingRequest: true },
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatGroups });
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
    [queryClient, userId],
  );

  return { statuses, loading, markPending };
}
