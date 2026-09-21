import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Users,
  ArrowUpRight,
  MessageCircle,
  LogOut,
  UserMinus,
  Crown,
} from "lucide-react";
import { api, Group, JoinRequest, date } from "./api";
import { useSession } from "./session";
import { useFeedback } from "./feedback";
import {
  useResource,
  PageHeader,
  Loading,
  Notice,
  Empty,
  Avatar,
} from "./ui";
import { useJoinRequests } from "./use-join-requests";
import { JoinRequestCard } from "./join-request-card";
export function GroupsPage() {
  const groups = useResource<Group[]>("/groups", []);
  return (
    <>
      <PageHeader
        eyebrow="TU COMUNIDAD"
        title="Mis grupos de estudio"
        description="Cada grupo es una oportunidad para avanzar juntos."
        action={
          <Link className="button secondary" to="/buscar">
            Encontrar un grupo <ArrowUpRight size={18} />
          </Link>
        }
      />
      <Notice error>{groups.error}</Notice>
      {groups.loading ? (
        <Loading />
      ) : groups.data.length ? (
        <div className="group-grid">
          {groups.data.map((g, i) => (
            <article className="group-card" key={g.id}>
              <div className={`group-art tone-${i % 3}`}>
                <Users size={38} />
                <span>
                  {g.role === "admin"
                    ? "Administras este grupo"
                    : "Tu comunidad"}
                </span>
              </div>
              <div className="group-card-body">
                <h3>{g.name}</h3>
                <p>{g.description}</p>
                <span className="small-label muted">
                  {g.member_count} de {g.max_capacity} integrantes
                </span>
                <Link to={`/grupos/${g.id}`} className="button secondary full">
                  Entrar al grupo <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty title="Aún no te has unido a un grupo">
          Busca una publicación y envía una solicitud, o crea tu propio grupo.
        </Empty>
      )}
    </>
  );
}
export function GroupPage() {
  const feedback = useFeedback();
  const { id } = useParams(),
    { user } = useSession(),
    navigate = useNavigate();
  const group = useResource<Group | null>(`/groups/${id}`, null),
    [error, setError] = useState("");
  async function action(path: string, method: string, body?: unknown) {
    setError("");
    try {
      const result = await api.request<{ message?: string }>(
        path,
        method,
        body,
      );
      feedback.notify(result.message || "Grupo actualizado");
      group.reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  if (group.loading) return <Loading />;
  const fallbackGroup: Group = {
    id: id || "",
    name: "Grupo de estudio",
    description: "Espacio de colaboración académica.",
    benefits: "Aprender en equipo",
    requirements: "Interés en el curso",
    admin_id: user?.id || "",
    max_capacity: 10,
    member_count: 1,
    role: "admin",
    members: [
      {
        user_id: user?.id || "",
        name: user?.name || "Estudiante",
        role: "admin",
      },
    ],
  };
  const g = group.data || fallbackGroup,
    admin = g.admin_id === user?.id;
  return (
    <>
      <PageHeader
        eyebrow={admin ? "ADMINISTRAS ESTE GRUPO" : "APRENDE EN EQUIPO"}
        title={g.name}
        description={g.description}
        action={
          <Link className="button" to={`/mensajes/${id}`}>
            <MessageCircle size={18} />
            Abrir conversación
          </Link>
        }
      />
      <Notice error>{error || group.error}</Notice>
      <div className="editor-layout">
        <section className="panel">
          <h2>
            Integrantes <span className="count">{(g.members || []).length}</span>
          </h2>
          {(g.members || []).map((m) => (
            <div className="member-row" key={m.user_id}>
              <Link to={`/perfil/${m.user_id}`} className="person">
                <Avatar name={m.name} src={m.photo_url} />
                <div>
                  <strong>{m.name}</strong>
                  <span>
                    {m.role === "admin"
                      ? "Administrador del grupo"
                      : "Integrante"}
                  </span>
                </div>
              </Link>
              {admin && m.user_id !== user?.id && (
                <div className="button-row">
                  <button
                    title="Transferir administración"
                    className="icon-button"
                    onClick={async () => {
                      if (
                        await feedback.confirm({
                          title: "Transferir administración",
                          description: `${m.name} administrará el grupo y tú pasarás a ser integrante.`,
                          acceptLabel: "Transferir",
                        })
                      )
                        action(`/groups/${id}/transfer`, "POST", {
                          user_id: m.user_id,
                        });
                    }}
                  >
                    <Crown size={18} />
                  </button>
                  <button
                    className="icon-button danger"
                    title="Expulsar integrante"
                    onClick={async () => {
                      if (
                        await feedback.confirm({
                          title: `¿Expulsar a ${m.name}?`,
                          description:
                            "Perderá el acceso al grupo y a su conversación. Se le notificará la decisión.",
                          acceptLabel: "Expulsar integrante",
                        })
                      )
                        action(`/groups/${id}/members/${m.user_id}`, "DELETE");
                    }}
                  >
                    <UserMinus size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
        <aside className="panel">
          <h3>Sobre el grupo</h3>
          <p>
            <strong>Beneficios</strong>
            <br />
            {g.benefits}
          </p>
          <p>
            <strong>Requisitos</strong>
            <br />
            {g.requirements}
          </p>
          <p className="muted">Capacidad: {g.max_capacity} integrantes</p>
          <button
            className="button secondary danger"
            onClick={async () => {
              if (
                !(await feedback.confirm({
                  title: "¿Salir del grupo?",
                  description: `Dejarás de pertenecer a ${g.name} y perderás el acceso a su conversación.`,
                  acceptLabel: "Salir del grupo",
                }))
              )
                return;
              try {
                await api.request(`/groups/${id}/membership`, "DELETE");
                feedback.notify("Saliste del grupo con éxito");
                navigate("/grupos");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <LogOut size={16} />
            Salir del grupo
          </button>
          {admin && (
            <small>
              Para salir, primero transfiere la administración a otro integrante
              activo.
            </small>
          )}
        </aside>
      </div>
    </>
  );
}
export function RequestsPage() {
  const {
    requests,
    emptyMessage,
    loading,
    error,
    actionError,
    processingId,
    acceptRequest,
    rejectRequest,
  } = useJoinRequests();

  return (
    <>
      <PageHeader
        eyebrow="GESTIONAR COMUNIDAD"
        title="Solicitudes de ingreso"
        description="Revisa quién quiere unirse a los grupos que administras."
      />
      <Notice error>{error || actionError}</Notice>
      {loading ? (
        <Loading />
      ) : requests.length > 0 ? (
        <div className="stack">
          {requests.map((r) => (
            <JoinRequestCard
              key={r.id}
              request={r}
              onAccept={acceptRequest}
              onReject={rejectRequest}
              isProcessing={processingId === r.id}
            />
          ))}
        </div>
      ) : (
        <Empty title="No hay solicitudes pendientes por revisar">
          {emptyMessage || "Las nuevas solicitudes aparecerán aquí."}
        </Empty>
      )}
    </>
  );
}
