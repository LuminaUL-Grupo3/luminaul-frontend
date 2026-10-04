import { useCallback, useEffect, useState } from "react";
import { api, GroupDetail, GroupMembershipStatus } from "./api";

/**
 * H.U 2.1 — Estado del usuario actual frente a cada grupo del feed.
 *
 * Consulta GET /groups/:group_id (una vez por grupo distinto) y guarda
 * my_status ("admin" | "member" | "pending" | "none"). El feed lo usa para:
 *  - mostrar "Me interesa" solo si el estado es "none",
 *  - mostrar "Solicitud pendiente" si ya se envió una solicitud,
 *  - ocultar la opción de enviar solicitud si el alumno ya es miembro (escenario 3).
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
          .request<GroupDetail>(`/groups/${id}`)
          .then((group) => [id, group.my_status] as const)
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
