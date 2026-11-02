import { Notice } from "@/components/ui";
import { useAdminStatsQuery } from "../hooks/useAdminQueries";
import { AdminStatsDto } from "../types";
import "../styles/admin.css";

const CARDS: { key: keyof AdminStatsDto; label: string }[] = [
  { key: "totalUsers", label: "Usuarios" },
  { key: "totalActiveGroups", label: "Grupos activos" },
  { key: "totalPosts", label: "Publicaciones" },
  { key: "pendingReports", label: "Reportes pendientes" },
  { key: "pendingAppeals", label: "Apelaciones pendientes" },
];

export function StatsCards() {
  const stats = useAdminStatsQuery();
  return (
    <>
      <Notice error>{stats.error?.message}</Notice>
      <div className="admin-stats">
        {CARDS.map(({ key, label }) => (
          <div className="panel admin-stat" key={key}>
            <strong>{stats.data ? stats.data[key] : "—"}</strong>
            <small className="muted">{label}</small>
          </div>
        ))}
      </div>
    </>
  );
}
