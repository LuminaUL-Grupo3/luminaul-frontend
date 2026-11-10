import { useCallback, useEffect, useState } from "react";
import { api } from "../../../config/api";

export type GroupMembershipStatus = "leader" | "admin" | "member" | "pending" | "none";

export interface GroupDetailMinimal {
  id: string;
  myRole: "leader" | "member" | null;
  pendingRequest: boolean;
}

/**
 * H.U 2.1 — Estado del usuario actual frente a cada grupo del feed.
 *
 * Consulta GET /groups/:groupId (una vez por grupo distinto) y deriva
 * el estado ("leader" | "member" | "pending" | "none") usando myRole y pendingRequest.
 */
export function useGroupStatuses(groupIds: string[]) {
  const [statuses, setStatuses] = useState<
    Record<string, GroupMembershipStatus>
  >({});
  const [loading, setLoading] = useState(false);
  const key = [...new Set(groupIds)].sort().join(",");

  useEffect(() => {
    const ids = key ? key.split(",") : [];
    if (ids.length === 0) {
      setStatuses({});
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all(
      ids.map((id) =>
        api
          .request<GroupDetailMinimal>(`/groups/${id}`)
          .then((group) => {
            const status: GroupMembershipStatus =
              group.myRole ?? (group.pendingRequest ? "pending" : "none");
            return [id, status] as const;
          })
          .catch(() => null),
      ),
    )
      .then((entries) => {
        if (!active) return;
        const next: Record<string, GroupMembershipStatus> = {};
        for (const entry of entries) {
          if (entry) next[entry[0]] = entry[1];
        }
        setStatuses(next);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [key]);

  /** Marca un grupo como "pending" después de enviar la solicitud con éxito. */
  const markPending = useCallback((groupId: string) => {
    setStatuses((current) => ({ ...current, [groupId]: "pending" }));
  }, []);

  return { statuses, loading, markPending };
}
