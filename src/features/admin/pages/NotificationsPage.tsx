import { useState } from "react";
import { Check } from "lucide-react";
import { date } from "@/config/api";
import { PageHeader, Loading, Notice, Empty } from "@/components/ui";
import {
  useMarkNotificationReadMutation,
  useMyNotificationsQuery,
} from "../hooks/useAdminQueries";
import "../styles/admin.css";

const TYPE_LABELS = { MODERATION: "Moderación", GROUP: "Grupos", SYSTEM: "Sistema" } as const;

export function NotificationsPage() {
  const notifications = useMyNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  const [error, setError] = useState("");
  const items = notifications.data ?? [];
  const unread = items.filter((n) => !n.isRead);

  // El contrato marca de una en una: se envían todas las pendientes en paralelo
  async function markAll() {
    setError("");
    try {
      await Promise.all(unread.map((n) => markRead.mutateAsync(n.id)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Notificaciones"
        description="Mantente al tanto de lo que pasa en tu comunidad."
        action={
          unread.length > 0 && (
            <button className="button secondary" onClick={markAll} disabled={markRead.isPending}>
              <Check size={17} />
              Marcar como leídas
            </button>
          )
        }
      />
      <Notice error>{error || notifications.error?.message}</Notice>
      {notifications.isLoading ? (
        <Loading />
      ) : items.length ? (
        <div className="stack">
          {items.map((n) => (
            <div
              className={`panel notification ${n.isRead ? "" : "unseen"}`}
              key={n.id}
              onClick={() => !n.isRead && markRead.mutate(n.id)}
            >
              <div className="notification-title">
                <strong>{n.title}</strong>
                <span className="tag">{TYPE_LABELS[n.type] ?? n.type}</span>
              </div>
              <p>{n.message}</p>
              <small className="muted">{date(n.createdAt)}</small>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="Estás al día" />
      )}
    </>
  );
}
