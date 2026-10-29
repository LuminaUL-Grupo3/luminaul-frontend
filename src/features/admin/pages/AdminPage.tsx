import { useState } from "react";
import { ShieldCheck, Flag, Users } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { ReportsTable, AppealsTable, UsersTable } from "../components";

export function AdminPage() {
  const [tab, setTab] = useState<"reports" | "appeals" | "users">("reports");

  return (
    <>
      <PageHeader
        eyebrow="ADMINISTRACIÓN DE LA PLATAFORMA"
        title="Cuidemos la comunidad."
        description="Revisa reportes, escucha apelaciones y documenta cada decisión."
      />
      <div className="tabs">
        {(
          [
            ["reports", "Reportes", Flag],
            ["appeals", "Apelaciones", ShieldCheck],
            ["users", "Usuarios", Users],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            className={tab === key ? "active" : ""}
            key={key}
            onClick={() => setTab(key)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
      {tab === "reports" ? (
        <ReportsTable />
      ) : tab === "appeals" ? (
        <AppealsTable />
      ) : (
        <UsersTable />
      )}
    </>
  );
}
