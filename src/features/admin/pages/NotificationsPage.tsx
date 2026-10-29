import { useState } from "react";
import { Check } from "lucide-react";
import { api, date } from "@/config/api";
import { useResource } from "@/hooks/useResource";
import { PageHeader, Loading, Notice, Empty } from "@/components/ui";
import { NoticeNotification } from "../types";

export function NotificationsPage() {
  const notices = useResource<NoticeNotification[]>("/notifications", []),
    [error, setError] = useState("");

  return (
    <>
      <PageHeader
        title="Notificaciones"
        description="Mantente al tanto de lo que pasa en tu comunidad."
        action={
          <button
            className="button secondary"
            onClick={() =>
              api
                .request("/notifications/read", "POST")
                .then(() => {
                  setError("");
                  notices.reload();
                })
                .catch((e) => setError((e as Error).message))
            }
          >
            <Check size={17} />
            Marcar como leídas
          </button>
        }
      />
      <Notice error>{error || notices.error}</Notice>
      {notices.loading ? (
        <Loading />
      ) : notices.data.length ? (
        <div className="stack">
          {notices.data.map((n) => (
            <div
              className={`panel notification ${n.is_read ? "" : "unseen"}`}
              key={n.id}
            >
              <p>{n.message}</p>
              <small className="muted">{date(n.created_at)}</small>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="Estás al día" />
      )}
    </>
  );
}
