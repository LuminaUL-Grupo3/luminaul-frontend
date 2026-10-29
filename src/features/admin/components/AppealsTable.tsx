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
import { Appeal } from "../types";

export function AppealsTable() {
  const rows = useResource<Appeal[]>("/admin/appeals", []),
    [selected, setSelected] = useState<Appeal | null>(null),
    [reason, setReason] = useState(""),
    [approve, setApprove] = useState(true);

  return (
    <>
      <Notice error>{rows.error}</Notice>
      {rows.loading ? (
        <Loading />
      ) : rows.data.length ? (
        <div className="stack">
          {rows.data.map((a) => (
            <article className="panel" key={a.id}>
              <div className="section-title">
                <Link to={`/perfil/${a.user_id}`}>
                  <h3>{a.author_name}</h3>
                </Link>
                <span className="tag">
                  {a.status === "pending"
                    ? "Pendiente"
                    : a.status === "approved"
                      ? "Aprobada"
                      : "Rechazada"}
                </span>
              </div>
              <small className="muted">{date(a.created_at)}</small>
              <p>
                <strong>Contenido apelado:</strong> {a.content}
              </p>
              <p>
                <strong>Apelación:</strong> {a.justification}
              </p>
              <p className="muted">Moderación original: {a.reason}</p>
              {a.resolution && <p>Decisión: {a.resolution}</p>}
              {a.status === "pending" && (
                <button
                  className="button secondary small"
                  onClick={() => {
                    setSelected(a);
                    setApprove(true);
                    setReason("");
                  }}
                >
                  Revisar apelación
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <Empty title="No hay apelaciones" />
      )}
      {selected && (
        <Modal title="Resolver apelación" close={() => setSelected(null)}>
          <ActionForm
            path={`/admin/appeals/${selected.id}/decision`}
            payload={() => ({ approve, reason })}
            label="Guardar decisión"
            done={() => {
              setSelected(null);
              rows.reload();
            }}
          >
            <Field label="Decisión">
              <select
                value={String(approve)}
                onChange={(e) => setApprove(e.target.value === "true")}
              >
                <option value="true">Aprobar y restaurar contenido</option>
                <option value="false">Rechazar apelación</option>
              </select>
            </Field>
            <Field label="Justificación">
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
