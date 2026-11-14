import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Bell, ShieldAlert, X } from "lucide-react";
import type { LiveNotice } from "../hooks/useNotificationRealtime";
import { useNoticeLifetime } from "@/hooks/useNoticeLifetime";

function NotificationToast({
  notice,
  dismiss,
}: {
  notice: LiveNotice;
  dismiss: (id: string) => void;
}) {
  const { closing, close } = useNoticeLifetime(() => dismiss(notice.id));
  return (
    <article
      className={`live-notice live-notice-${notice.priority} ${closing ? "notice-closing" : ""}`}
      role={notice.priority === "high" ? "alert" : "status"}
    >
      <span className="notice-lifetime" aria-hidden="true">
        <span />
      </span>
      <span className="live-notice-icon">
        {notice.priority === "high" ? (
          <ShieldAlert size={19} />
        ) : (
          <Bell size={19} />
        )}
      </span>
      <div>
        <strong>{notice.title}</strong>
        <p>{notice.message}</p>
        <Link to="/notificaciones" onClick={close}>
          Ver notificaciones
        </Link>
      </div>
      <button
        type="button"
        className="icon-button"
        aria-label={`Cerrar aviso: ${notice.title}`}
        onClick={close}
      >
        <X size={16} />
      </button>
    </article>
  );
}
export function NotificationToasts({
  notices,
  dismiss,
}: {
  notices: LiveNotice[];
  dismiss: (id: string) => void;
}) {
  const [region, setRegion] = useState<HTMLElement | null>(null);
  // Comparte la pila de avisos con las confirmaciones de acciones para evitar solapamientos.
  useEffect(() => setRegion(document.getElementById("app-notice-region")), []);
  if (!region) return null;
  return createPortal(
    <div className="live-notices">
      {notices.map((notice) => (
        <NotificationToast key={notice.id} notice={notice} dismiss={dismiss} />
      ))}
    </div>,
    region,
  );
}
