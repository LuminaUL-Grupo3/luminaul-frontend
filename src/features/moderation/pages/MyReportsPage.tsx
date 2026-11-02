import { useState } from "react";
import { Flag, ShieldAlert } from "lucide-react";
import { date } from "@/config/api";
import { Empty, Loading, Notice, PageHeader } from "@/components/ui";
import { useMyModerationLogsQuery, useMyReportsQuery } from "../hooks/useModerationQueries";
import { AppealModal } from "../components";
import {
  APPEAL_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
  ModerationLogDto,
  REPORT_STATUS_LABELS,
} from "../types";

// HU 6.3 y 6.4: contenido propio moderado (con apelación) y reportes enviados
export function MyReportsPage() {
  const [tab, setTab] = useState<"moderated" | "reports">("moderated");

  return (
    <>
      <PageHeader
        eyebrow="UNA COMUNIDAD CON RESPETO"
        title="Moderación"
        description="Revisa tu contenido moderado, apela si fue un error y sigue tus reportes."
      />
      <div className="tabs">
        {(
          [
            ["moderated", "Mi contenido moderado", ShieldAlert],
            ["reports", "Mis reportes", Flag],
          ] as const
        ).map(([key, label, Icon]) => (
          <button className={tab === key ? "active" : ""} key={key} onClick={() => setTab(key)}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
      {tab === "moderated" ? <ModeratedContentList /> : <MyReportsList />}
    </>
  );
}

function ModeratedContentList() {
  const logs = useMyModerationLogsQuery(),
    [selected, setSelected] = useState<ModerationLogDto | null>(null);

  if (logs.isLoading) return <Loading />;
  if (logs.error) return <Notice error>{logs.error.message}</Notice>;
  if (!logs.data?.length)
    return (
      <Empty title="No tienes contenido moderado">
        Gracias por ayudar a mantener una comunidad respetuosa.
      </Empty>
    );

  return (
    <div className="stack">
      {logs.data.map((log) => (
        <article className="panel" key={log.id}>
          <span className="tag warning">
            {CONTENT_TYPE_LABELS[log.contentType]} ·{" "}
            {log.appealStatus ? APPEAL_STATUS_LABELS[log.appealStatus] : "Contenido oculto"}
          </span>
          <p>{log.content ?? "Este contenido ya fue eliminado."}</p>
          <p className="muted">
            Términos detectados: {log.detectedWords.join(", ")} · {date(log.moderatedAt)}
          </p>
          {log.canAppeal && (
            <button className="button secondary small" onClick={() => setSelected(log)}>
              Apelar decisión
            </button>
          )}
        </article>
      ))}
      {selected && <AppealModal log={selected} close={() => setSelected(null)} />}
    </div>
  );
}

function MyReportsList() {
  const reports = useMyReportsQuery();

  if (reports.isLoading) return <Loading />;
  if (reports.error) return <Notice error>{reports.error.message}</Notice>;
  if (!reports.data?.length)
    return (
      <Empty title="Aún no has reportado contenido">
        Si ves algo que incumple las normas, usa el botón de reportar.
      </Empty>
    );

  return (
    <div className="stack">
      {reports.data.map((report) => (
        <article className="panel" key={report.id}>
          <span className="tag">
            {CONTENT_TYPE_LABELS[report.targetType]} · {REPORT_STATUS_LABELS[report.status]}
          </span>
          <p>{report.reason}</p>
          <p className="muted">{date(report.createdAt)}</p>
        </article>
      ))}
    </div>
  );
}
