import { useNotificationRealtime } from "../hooks/useNotificationRealtime";
import { useNotificationRealtimeStore } from "../store/useNotificationRealtimeStore";
import { NotificationToasts } from "./NotificationToasts";

/**
 * Monta una única suscripción en tiempo real a `/notifications` en el shell autenticado,
 * manteniendo a NotificationsBell como un componente puramente visual.
 */
export function NotificationRealtimeHost() {
  useNotificationRealtime();
  const notices = useNotificationRealtimeStore((s) => s.notices);
  const removeNotice = useNotificationRealtimeStore((s) => s.removeNotice);
  return <NotificationToasts notices={notices} dismiss={removeNotice} />;
}

