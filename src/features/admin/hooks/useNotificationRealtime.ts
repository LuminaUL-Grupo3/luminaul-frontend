import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useClearSession } from "@/features/auth";
import { queryKeys } from "@/config/queryKeys";
import { useFeedback } from "@/hooks/useFeedback";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { getNotificationSocket } from "../services/notificationSocketClient";
import {
  useNotificationRealtimeStore,
  type LiveNotice,
} from "../store/useNotificationRealtimeStore";
import { adminKeys, notificationKeys } from "./useAdminQueries";
import type { NotificationDto } from "../types";

export type { LiveNotice };

/** Una conexión compartida recibe avisos del namespace `/notifications` y recupera el historial tras reconectar. */
export function useNotificationRealtime() {
  const userId = useAuthStore((s) => s.user?.id || "");
  const cache = useQueryClient();
  const clearSession = useClearSession();
  const navigate = useNavigate();
  const feedback = useFeedback();
  const { preferences } = useNotificationPreferences(userId);
  const preference = useRef(preferences);
  preference.current = preferences;

  const setConnected = useNotificationRealtimeStore((s) => s.setConnected);
  const pushNotice = useNotificationRealtimeStore((s) => s.pushNotice);
  const removeNotice = useNotificationRealtimeStore((s) => s.removeNotice);
  const clearNotices = useNotificationRealtimeStore((s) => s.clearNotices);

  useEffect(() => {
    clearNotices();
    setConnected(false);
    if (!userId) return;

    const socket = getNotificationSocket();
    const seen = new Set<string>();
    const readIds = new Set<string>();
    let active = true;

    const refresh = () => {
      setConnected(true);
      void cache.invalidateQueries({ queryKey: notificationKeys.root });
    };
    const disconnected = () => setConnected(false);

    const receive = async (notification: NotificationDto) => {
      if (!active || notification.userId !== userId) return;
      const userKey = notificationKeys.byUser(userId);
      const hadHistory = cache.getQueryData(userKey) !== undefined;
      // Una consulta iniciada antes del evento no puede sobrescribir el aviso recién recibido.
      await cache.cancelQueries({ queryKey: userKey });
      if (!active) return;

      cache.setQueryData<NotificationDto[]>(userKey, (previous) => {
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
      });

      // Si el primer aviso llega durante la carga inicial, recupera también los avisos anteriores.
      if (!hadHistory) void cache.invalidateQueries({ queryKey: userKey });
      if (notification.type === "GROUP")
        void cache.invalidateQueries({ queryKey: queryKeys.chatGroups });
      if (notification.type === "MODERATION")
        void cache.invalidateQueries({ queryKey: adminKeys.root });

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
      const currentPref = preference.current;
      if (
        !currentPref.enabled ||
        (currentPref.minimum === "high" && priority !== "high") ||
        (currentPref.minimum === "normal" && priority === "low")
      ) {
        return;
      }

      pushNotice({ ...notification, priority });
    };

    const read = ({ id }: { id: string }) => {
      readIds.add(id);
      if (readIds.size > 500) readIds.delete(readIds.values().next().value!);
      cache.setQueryData<NotificationDto[]>(
        notificationKeys.byUser(userId),
        (previous) =>
          previous?.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      removeNotice(id);
    };

    const suspended = ({ message }: { message: string }) => {
      if (!active) return;
      // La preferencia de pop-ups nunca impide informar una revocación ni deja acceso a una cuenta suspendida.
      void feedback.alert({
        title: "Cuenta suspendida",
        description: message,
        acceptLabel: "Entendido",
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
  }, [
    userId,
    cache,
    clearSession,
    navigate,
    feedback.alert,
    setConnected,
    pushNotice,
    removeNotice,
    clearNotices,
  ]);

  useEffect(() => {
    if (!preferences.enabled) clearNotices();
  }, [preferences.enabled, clearNotices]);
}
