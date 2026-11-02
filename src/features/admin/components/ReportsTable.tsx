import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { date } from "@/config/api";
import { Loading, Notice, Empty, Modal, Field } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { useAdminReportsQuery, useResolveReportMutation } from "../hooks/useAdminQueries";
import { AdminContentType, AdminReportDetailDto, AdminReportStatus } from "../types";
import { SuspendUserModal } from "./SuspendUserModal";

export const CONTENT_LABELS: Record<AdminContentType, string> = {
  publication: "Publicación",
  message: "Mensaje",
  review: "Reseña",
};

const STATUS_LABELS: Record<AdminReportStatus, string> = {
  pending: "Pendiente",
  resolved: "Resuelto",
  dismissed: "Desestimado",
};

type Decision = { report: AdminReportDetailDto; deleteContent: boolean };

// HU 7.4 (historial de reportes) + HU 7.2 (eliminar contenido) + acceso a HU 7.1 (suspender)
export function ReportsTable() {
  const [filter, setFilter] = useState<AdminReportStatus | undefined>("pending");
  const reports = useAdminReportsQuery(filter);
  const [decision, setDecision] = useState<Decision | null>(null),
    [suspending, setSuspending] = useState<{ id: string; name: string } | null>(null);

  const items = reports.data?.items ?? [];

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
          Todos
        </button>
      </div>
      <Notice error>{reports.error?.message}</Notice>
      {reports.isLoading ? (
        <Loading />
      ) : items.length ? (
        <div className="stack">
          {items.map((r) => (
            <article className="panel" key={r.id}>
              <div className="section-title">
                <span className="tag">
                  {CONTENT_LABELS[r.target.type] ?? r.target.type} · {STATUS_LABELS[r.status]}
                </span>
                <small className="muted">{date(r.createdAt)}</small>
              </div>
              <p>{r.target.content ?? <em className="muted">Contenido no disponible</em>}</p>
              <p>
                <strong>Motivo del reporte:</strong> {r.reason}
              </p>
              <p className="muted">
                Reportado por {r.reporter.name} · Estado del contenido:{" "}
                {r.target.currentStatus ?? "—"}
              </p>
              {r.resolutionNotes && <p className="muted">Notas: {r.resolutionNotes}</p>}
              <div className="button-row">
                {r.target.authorId && (
                  <Link to={`/perfil/${r.target.authorId}`} className="text-button">
                    Infractor: {r.target.authorName || "Ver autor"}
                  </Link>
                )}
                {r.target.authorId && r.target.authorStatus === "active" && (
                  <button
                    className="button secondary small"
                    onClick={() =>
                      setSuspending({ id: r.target.authorId!, name: r.target.authorName ?? "" })
                    }
                  >
                    Suspender cuenta
                  </button>
                )}
                {r.status === "pending" && (
                  <>
                    <button
                      className="button secondary small danger"
                      onClick={() => setDecision({ report: r, deleteContent: true })}
                    >
                      Eliminar {CONTENT_LABELS[r.target.type]?.toLowerCase() ?? "contenido"}
                    </button>
                    <button
                      className="button secondary small"
                      onClick={() => setDecision({ report: r, deleteContent: false })}
                    >
                      Desestimar
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty title="No hay contenido reportado" />
      )}
      {decision && <ResolveReportModal decision={decision} close={() => setDecision(null)} />}
      {suspending && (
        <SuspendUserModal user={suspending} suspend close={() => setSuspending(null)} />
      )}
    </>
  );
}

function ResolveReportModal({ decision, close }: { decision: Decision; close: () => void }) {
  const feedback = useFeedback();
  const mutation = useResolveReportMutation();
  const [notes, setNotes] = useState(""),
    [error, setError] = useState("");
  const { report, deleteContent } = decision;
  const label = CONTENT_LABELS[report.target.type]?.toLowerCase() ?? "contenido";

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const result = await mutation.mutateAsync({
        id: report.id,
        payload: deleteContent
          ? { status: "resolved", action: "delete_content", notes: notes.trim() || undefined }
          : { status: "dismissed", action: "none", notes: notes.trim() || undefined },
      });
      feedback.notify(result.message);
      close();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <Modal
      title={deleteContent ? `Eliminar ${label} reportada` : "Desestimar reporte"}
      close={close}
    >
      <form className="form" onSubmit={submit}>
        <p>
          {deleteContent
            ? `Se quitará del sitio y se notificará al autor (${report.target.authorName ?? "autor"}).`
            : "El contenido seguirá visible y el reporte quedará cerrado."}
        </p>
        <Field label="Notas de la decisión (opcional)">
          <textarea maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Notice error>{error}</Notice>
        <button className="button" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando…" : "Confirmar"}
        </button>
        <button type="button" className="button secondary" onClick={close}>
          Cancelar
        </button>
      </form>
    </Modal>
  );
}
