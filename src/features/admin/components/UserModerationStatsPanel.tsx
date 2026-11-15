import { Notice } from "@/components/ui";
import { useAdminUserModerationStatsQuery } from "../hooks/useAdminQueries";
import "../styles/admin.css";

export function UserModerationStatsPanel({ userId }: { userId: string }) {
  const stats = useAdminUserModerationStatsQuery(userId);

  return (
    <section className="panel stack" aria-label="Estadísticas de moderación del usuario">
      <div className="section-title">
        <h2>Historial de moderación</h2>
        <span className="tag">Solo admin</span>
      </div>
      <Notice error>{stats.error?.message}</Notice>
      <div className="admin-stats">
        <div className="panel admin-stat">
          <strong>{stats.data ? stats.data.reportsReceivedCount : "—"}</strong>
          <small className="muted">Veces reportado</small>
        </div>
        <div className="panel admin-stat">
          <strong>{stats.data ? stats.data.removedContentCount : "—"}</strong>
          <small className="muted">Contenido eliminado</small>
        </div>
        <div className="panel admin-stat">
          <strong>{stats.data ? stats.data.suspensionsCount : "—"}</strong>
          <small className="muted">Veces suspendido</small>
        </div>
      </div>
    </section>
  );
}
