import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useClearSession } from "@/features/auth/hooks/useSession";
import { useFeedback } from "@/hooks/useFeedback";
import { getChatSocket } from "@/features/chat/services/socketClient";
import type { NotificationDto } from "../types";
import { useNotificationPreferences } from "./useNotificationPreferences";

export type LiveNotice = NotificationDto & {
  priority: "high" | "normal" | "low";
};
/** Una conexión compartida recibe avisos de la sala privada y recupera el historial tras reconectar. */
export function useNotificationRealtime() {
  const user = useAuthStore((s) => s.user),
    cache = useQueryClient(),
    clearSession = useClearSession(),
    navigate = useNavigate(),
    feedback = useFeedback();
  const { preferences } = useNotificationPreferences(user?.id || "");
  const preference = useRef(preferences);
  preference.current = preferences;
  const [notices, setNotices] = useState<LiveNotice[]>([]);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    setNotices([]);
    setConnected(false);
    if (!user) return;
    const socket = getChatSocket(),
      seen = new Set<string>(),
      readIds = new Set<string>();
    let active = true;
    const refresh = () => {
      setConnected(true);
      void cache.invalidateQueries({ queryKey: ["notifications"] });
    };
    const disconnected = () => setConnected(false);
    const receive = async (notification: NotificationDto) => {
      if (!active || notification.userId !== user.id) return;
      const hadHistory =
        cache.getQueryData(["notifications", user.id]) !== undefined;
      // Una consulta iniciada antes del evento no puede sobrescribir el aviso recién recibido.
      await cache.cancelQueries({ queryKey: ["notifications", user.id] });
      if (!active) return;
      cache.setQueryData<NotificationDto[]>(
        ["notifications", user.id],
        (previous) => {
          const known = previous?.find((n) => n.id === notification.id);
          return [
            {
              ...notification,
              isRead:
                notification.isRead ||
                Boolean(known?.isRead) ||
                readIds.has(notification.id),
            },
            ...(previous || []).filter((n) => n.id !== notification.id),
          ]
            .sort(
              (a, b) =>
                b.createdAt.localeCompare(a.createdAt) ||
                b.id.localeCompare(a.id),
            )
            .slice(0, 100);
        },
      );
      // Si el primer aviso llega durante la carga inicial, recupera también los avisos anteriores.
      if (!hadHistory)
        void cache.invalidateQueries({ queryKey: ["notifications", user.id] });
      if (notification.type === "GROUP")
        void cache.invalidateQueries({ queryKey: ["spec04"] });
      if (notification.type === "MODERATION")
        void cache.invalidateQueries({ queryKey: ["admin"] });
      if (seen.has(notification.id)) return;
      seen.add(notification.id);
      if (seen.size > 500) seen.delete(seen.values().next().value!);
      if (notification.isRead || readIds.has(notification.id)) return;
      const priority: LiveNotice["priority"] =
        notification.type === "MODERATION"
          ? "high"
          : notification.type === "GROUP"
            ? "normal"
            : "low";
      const p = preference.current;
      if (
        !p.enabled ||
        (p.minimum === "high" && priority !== "high") ||
        (p.minimum === "normal" && priority === "low")
      )
        return;
      const notice: LiveNotice = { ...notification, priority };
      const rank = { high: 0, normal: 1, low: 2 };
      setNotices((previous) =>
        [...previous, notice]
          .sort((a, b) => rank[a.priority] - rank[b.priority])
          .slice(0, 3),
      );
    };
    const read = ({ id }: { id: string }) => {
      readIds.add(id);
      if (readIds.size > 500) readIds.delete(readIds.values().next().value!);
      cache.setQueryData<NotificationDto[]>(
        ["notifications", user.id],
        (previous) =>
          previous?.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setNotices((previous) => previous.filter((n) => n.id !== id));
    };
    const suspended = ({ message }: { message: string }) => {
      if (!active) return;
      // La preferencia de pop-ups nunca impide informar una revocación ni deja acceso a una cuenta suspendida.
      void feedback.confirm({
        title: "Cuenta suspendida",
        description: message,
        acceptLabel: "Entendido",
        cancelLabel: "Cerrar",
      });
      clearSession();
      navigate("/login", { replace: true });
    };
    socket.on("notifications:ready", refresh);
    socket.on("disconnect", disconnected);
    socket.on("notification:new", receive);
    socket.on("notification:read", read);
    socket.on("account:suspended", suspended);
    if (socket.connected) refresh();
    else socket.connect();
    return () => {
      active = false;
      socket.off("notifications:ready", refresh);
      socket.off("disconnect", disconnected);
      socket.off("notification:new", receive);
      socket.off("notification:read", read);
      socket.off("account:suspended", suspended);
    };
  }, [user?.id, cache, clearSession, navigate, feedback.confirm]);
  useEffect(() => {
    if (!preferences.enabled) setNotices([]);
  }, [preferences.enabled]);
  return {
    notices,
    connected,
    dismiss: (id: string) =>
      setNotices((previous) => previous.filter((n) => n.id !== id)),
  };
}
