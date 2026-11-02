import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useMyNotificationsQuery } from "../hooks/useAdminQueries";
import "../styles/admin.css";

// Campana de la barra superior con el contador de notificaciones sin leer
export function NotificationsBell() {
  const notifications = useMyNotificationsQuery();
  const unread = notifications.data?.filter((n) => !n.isRead).length ?? 0;

  return (
    <Link
      className="icon-button notifications-bell"
      title="Notificaciones"
      aria-label={unread ? `Notificaciones (${unread} sin leer)` : "Notificaciones"}
      to="/notificaciones"
    >
      <Bell size={21} />
      {unread > 0 && <span className="bell-badge">{unread > 9 ? "9+" : unread}</span>}
    </Link>
  );
}
