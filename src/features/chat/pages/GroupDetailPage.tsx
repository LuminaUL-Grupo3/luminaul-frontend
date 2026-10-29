import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MessageCircle, LogOut } from "lucide-react";
import { api } from "@/config/api";
import { useSession } from "@/features/auth";
import { useFeedback } from "@/hooks/useFeedback";
import { useResource } from "@/hooks/useResource";
import { PageHeader, Loading, Notice } from "@/components/ui";
import { Group } from "../types";
import { GroupMembersList } from "../components";

export function GroupDetailPage() {
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

  async function handleTransferAdmin(userId: string, userName: string) {
    if (
      await feedback.confirm({
        title: "Transferir administración",
        description: `${userName} administrará el grupo y tú pasarás a ser integrante.`,
        acceptLabel: "Transferir",
      })
    ) {
      action(`/groups/${id}/transfer`, "POST", { user_id: userId });
    }
  }

  async function handleExpelMember(userId: string, userName: string) {
    if (
      await feedback.confirm({
        title: `¿Expulsar a ${userName}?`,
        description:
          "Perderá el acceso al grupo y a su conversación. Se le notificará la decisión.",
        acceptLabel: "Expulsar integrante",
      })
    ) {
      action(`/groups/${id}/members/${userId}`, "DELETE");
    }
  }

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
        <GroupMembersList
          members={g.members || []}
          isAdmin={admin}
          currentUserId={user?.id}
          onTransferAdmin={handleTransferAdmin}
          onExpelMember={handleExpelMember}
        />
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
