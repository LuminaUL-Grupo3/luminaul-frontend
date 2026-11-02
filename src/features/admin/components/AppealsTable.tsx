import { useState } from "react";
import { Link } from "react-router-dom";
import { date } from "@/config/api";
import { Loading, Notice, Empty } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { useAdminAppealsQuery, useResolveAppealMutation } from "../hooks/useAdminQueries";
import { AdminAppealDetailDto, AdminAppealStatus } from "../types";
import { CONTENT_LABELS } from "./ReportsTable";

const STATUS_LABELS: Record<AdminAppealStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

// HU 7.5 (historial de apelaciones) + HU 7.3 (aprobar o rechazar)
export function AppealsTable() {
  const feedback = useFeedback();
  const [filter, setFilter] = useState<AdminAppealStatus | undefined>("pending");
  const appeals = useAdminAppealsQuery(filter);
  const mutation = useResolveAppealMutation();
  const [error, setError] = useState("");

  async function decide(appeal: AdminAppealDetailDto, approve: boolean) {
    const accepted = await feedback.confirm({
      title: approve ? "Aprobar apelación" : "Rechazar apelación",
      description: approve
        ? `Se restaurará el contenido de ${appeal.user.name} y se le notificará.`
        : `El contenido de ${appeal.user.name} seguirá oculto y se le notificará.`,
      acceptLabel: approve ? "Aprobar apelación" : "Rechazar apelación",
    });
    if (!accepted) return;
    setError("");
    try {
      const result = await mutation.mutateAsync({
        id: appeal.id,
        payload: { status: approve ? "approved" : "rejected" },
      });
      feedback.notify(result.message);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const items = appeals.data?.items ?? [];

  return (
    <>
      <div className="button-row">
        <button
          className={`button small ${filter === "pending" ? "" : "secondary"}`}
          onClick={() => setFilter("pending")}
        >
          Pendientes
        </button>
        <button
          className={`button small ${filter === undefined ? "" : "secondary"}`}
          onClick={() => setFilter(undefined)}
        >
          Todas
        </button>
      </div>
      <Notice error>{error || appeals.error?.message}</Notice>
      {appeals.isLoading ? (
        <Loading />
      ) : items.length ? (
        <div className="stack">
          {items.map((a) => (
            <article className="panel" key={a.id}>
              <div className="section-title">
                <Link to={`/perfil/${a.user.id}`}>
                  <h3>{a.user.name}</h3>
                </Link>
                <span className="tag">
                  {CONTENT_LABELS[a.content.type] ?? a.content.type} · {STATUS_LABELS[a.status]}
                </span>
              </div>
              <small className="muted">Apelada el {date(a.createdAt)}</small>
              <p>
                <strong>Contenido apelado:</strong>{" "}
                {a.content.text ?? <em className="muted">Contenido no disponible</em>}
              </p>
              <p>
                <strong>Justificación:</strong> {a.justification}
              </p>
              {a.content.detectedWords.length > 0 && (
                <p className="muted">
                  Palabras detectadas por el bot: {a.content.detectedWords.join(", ")}
                </p>
              )}
              {a.status === "pending" && (
                <div className="button-row">
                  <button
                    className="button small"
                    disabled={mutation.isPending}
                    onClick={() => decide(a, true)}
                  >
                    Aprobar apelación
                  </button>
                  <button
                    className="button secondary small danger"
                    disabled={mutation.isPending}
                    onClick={() => decide(a, false)}
                  >
                    Rechazar apelación
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <Empty title="No hay apelaciones" />
      )}
    </>
  );
}
