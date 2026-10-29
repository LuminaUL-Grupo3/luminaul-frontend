import { useState } from "react";
import { Link } from "react-router-dom";
import { date } from "@/config/api";
import { useResource } from "@/hooks/useResource";
import {
  Loading,
  Notice,
  Empty,
  Modal,
  ActionForm,
  Field,
} from "@/components/ui";
import { Report } from "../types";

export function ReportsTable() {
  const rows = useResource<Report[]>("/admin/reports", []),
    [suspending, setSuspending] = useState<Report | null>(null),
    [selected, setSelected] = useState<Report | null>(null),
    [reason, setReason] = useState("");

  return (
    <>
      <Notice error>{rows.error}</Notice>
      {rows.loading ? (
        <Loading />
      ) : rows.data.length ? (
        <div className="stack">
          {rows.data.map((r) => (
            <article className="panel" key={r.id}>
              <div className="section-title">
                <span className="tag">
                  {r.publication_id
                    ? "Publicación"
                    : r.message_id
                      ? "Mensaje"
                      : "Reseña"}{" "}
                  · {r.status === "pending" ? "Pendiente" : "Resuelto"}
                </span>
                <small className="muted">{date(r.created_at)}</small>
              </div>
              <p>{r.content}</p>
              <p>
                <strong>Motivo del reporte:</strong> {r.reason}
              </p>
              <div className="button-row">
                <Link to={`/perfil/${r.author_id}`} className="text-button">
                  {r.author_name || "Ver autor"}
                </Link>
                {r.author_role === "student" &&
                  r.author_status === "active" && (
                    <button
                      className="button secondary small"
                      onClick={() => {
                        setSuspending(r);
                        setReason("");
                      }}
                    >
                      Suspender cuenta
                    </button>
                  )}
                {r.publication_id && r.status === "pending" && (
                  <button
                    className="button secondary small danger"
                    onClick={() => {
                      setSelected(r);
                      setReason("");
                    }}
                  >
                    Eliminar publicación
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty title="No hay contenido reportado" />
      )}
      {selected && (
        <Modal
          title="Eliminar publicación reportada"
          close={() => setSelected(null)}
        >
          <ActionForm
            path={`/admin/posts/${selected.publication_id}/remove`}
            payload={() => ({ reason })}
            label="Confirmar eliminación"
            done={() => {
              setSelected(null);
              rows.reload();
            }}
          >
            <Field label="Justificación de la decisión">
              <textarea
                required
                minLength={5}
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
          </ActionForm>
        </Modal>
      )}
      {suspending && (
        <Modal title="Suspender cuenta" close={() => setSuspending(null)}>
          <p>
            Se restringirá el acceso de {suspending.author_name} y se cerrarán
            sus sesiones activas.
          </p>
          <ActionForm
            path={`/admin/users/${suspending.author_id}/status`}
            payload={() => ({ suspended: true, reason })}
            label="Confirmar suspensión"
            done={() => {
              setSuspending(null);
              rows.reload();
            }}
          >
            <Field label="Motivo de suspensión">
              <textarea
                required
                minLength={5}
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
          </ActionForm>
        </Modal>
      )}
    </>
  );
}
