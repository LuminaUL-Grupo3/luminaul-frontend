import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Flag, Users, Check, RotateCcw } from "lucide-react";
import {
  api,
  Moderated,
  Notice as Notification,
  Appeal,
  Report,
  AdminUser,
  date,
} from "./api";
import {
  useResource,
  PageHeader,
  Loading,
  Notice,
  Empty,
  Modal,
  ActionForm,
  Field,
} from "./ui";
export function ModerationPage() {
  const data = useResource<Moderated[]>("/moderation/me", []),
    [selected, setSelected] = useState<Moderated | null>(null),
    [justification, setJustification] = useState("");
  return (
    <>
      <PageHeader
        eyebrow="UNA COMUNIDAD CON RESPETO"
        title="Mis contenidos moderados"
        description="Consulta las decisiones y solicita una revisión cuando sea necesario."
      />
      <Notice error>{data.error}</Notice>
      {data.loading ? (
        <Loading />
      ) : data.data.length ? (
        <div className="stack">
          {data.data.map((c) => (
            <article className="panel" key={c.id}>
              <span className="tag warning">
                {c.publication_id
                  ? "Publicación"
                  : c.message_id
                    ? "Mensaje"
                    : "Reseña"}{" "}
                ·{" "}
                {c.appeal_status === "approved"
                  ? "Apelación aprobada"
                  : c.result === "hidden"
                    ? "Contenido oculto"
                    : "En revisión"}
              </span>
              <p>{c.content}</p>
              <p className="muted">
                {c.reason} · {date(c.created_at)}
              </p>
              {c.appeal_status ? (
                <span className="small-label">
                  Apelación:{" "}
                  {c.appeal_status === "pending"
                    ? "pendiente"
                    : c.appeal_status === "approved"
                      ? "aprobada"
                      : "rechazada"}
                </span>
              ) : (
                <button
                  className="button secondary small"
                  onClick={() => {
                    setSelected(c);
                    setJustification("");
                  }}
                >
                  Apelar decisión
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <Empty title="No tienes contenido moderado">
          Gracias por ayudar a mantener una comunidad respetuosa.
        </Empty>
      )}
      {selected && (
        <Modal title="Solicitar revisión" close={() => setSelected(null)}>
          <ActionForm
            path="/appeals"
            payload={() => ({ moderation_log_id: selected.id, justification })}
            label="Enviar apelación"
            done={() => {
              setSelected(null);
              data.reload();
            }}
          >
            <Field
              label="Justificación"
              hint="Explica el contexto. Al menos 10 caracteres."
            >
              <textarea
                required
                minLength={10}
                maxLength={1500}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
              />
            </Field>
          </ActionForm>
        </Modal>
      )}
    </>
  );
}
export function NotificationsPage() {
  const notices = useResource<Notification[]>("/notifications", []),
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
        <AdminReports />
      ) : tab === "appeals" ? (
        <AdminAppeals />
      ) : (
        <AdminUsers />
      )}
    </>
  );
}
function AdminReports() {
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
function AdminAppeals() {
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
function AdminUsers() {
  const rows = useResource<AdminUser[]>("/admin/users", []),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<AdminUser | null>(null),
    [reason, setReason] = useState("");
  return (
    <>
      <input
        className="search-bar"
        aria-label="Buscar usuario"
        placeholder="Buscar por nombre o correo"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Notice error>{rows.error}</Notice>
      {rows.loading ? (
        <Loading />
      ) : (
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.data
                .filter((u) =>
                  `${u.name} ${u.email}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      <small>{u.email}</small>
                    </td>
                    <td>
                      <span className="tag">
                        {u.status === "active"
                          ? "Activo"
                          : u.status === "suspended"
                            ? "Suspendido"
                            : "Pendiente de verificación"}
                      </span>
                    </td>
                    <td>
                      {u.role === "student" &&
                        ["active", "suspended"].includes(u.status) && (
                          <button
                            className="text-button"
                            onClick={() => {
                              setSelected(u);
                              setReason("");
                            }}
                          >
                            {u.status === "suspended" ? (
                              <>
                                <RotateCcw size={15} />
                                Reactivar
                              </>
                            ) : (
                              "Suspender"
                            )}
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {selected && (
        <Modal
          title={
            selected.status === "suspended"
              ? "Reactivar cuenta"
              : "Suspender cuenta"
          }
          close={() => setSelected(null)}
        >
          <p>{selected.name}</p>
          <ActionForm
            path={`/admin/users/${selected.id}/status`}
            payload={() => ({
              suspended: selected.status !== "suspended",
              reason,
            })}
            label="Confirmar decisión"
            done={() => {
              setSelected(null);
              rows.reload();
            }}
          >
            <Field label="Motivo">
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
