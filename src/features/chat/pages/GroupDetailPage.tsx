import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, LogOut, MessageCircle, Users, Send } from "lucide-react";
import { useSession } from "@/features/auth";
import { useFeedback } from "@/hooks/useFeedback";
import { Field, Loading, Modal, Notice, PageHeader } from "@/components/ui";
import {
  groupKeys,
  useGroupDetailQuery,
  useGroupMembersQuery,
} from "../hooks/useGroupQueries";
import { messagingService } from "../services/messagingService";
import { GroupMembersList } from "../components/GroupMembersList";
import "../styles/chat.css";

/** Reemplaza los permisos ficticios por el estado de membresía y liderazgo consultado en el servidor. */
export function GroupDetailPage() {
  const { id = "" } = useParams(),
    { user } = useSession(),
    navigate = useNavigate(),
    feedback = useFeedback(),
    cache = useQueryClient();
  const group = useGroupDetailQuery(id),
    members = useGroupMembersQuery(id, group.data?.myStatus === "active");
  const [joinOpen, setJoinOpen] = useState(false),
    [success, setSuccess] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const join = useMutation({
    mutationFn: () => messagingService.join(id, message.trim()),
  });
  const action = useMutation({
    mutationFn: (operation: () => Promise<{ message: string }>) => operation(),
    onSuccess: async (result) => {
      feedback.notify(result.message);
      await cache.invalidateQueries({ queryKey: groupKeys.root });
    },
  });
  const isLeader = group.data?.myRole === "leader",
    active = group.data?.myStatus === "active";

  /** Confirma el envío con un modal del diseño existente y refleja inmediatamente el estado pendiente. */
  async function requestJoin(event: FormEvent) {
    event.preventDefault();
    if (join.isPending) return;
    setError("");
    try {
      await join.mutateAsync();
      setJoinOpen(false);
      setSuccess(true);
      await cache.invalidateQueries({ queryKey: groupKeys.root });
    } catch (cause) {
      setError((cause as Error).message);
    }
  }

  /** Las acciones de membresía esperan el resultado real y muestran los errores en la página. */
  async function run(operation: () => Promise<{ message: string }>) {
    setError("");
    try {
      await action.mutateAsync(operation);
      return true;
    } catch (cause) {
      setError((cause as Error).message);
      return false;
    }
  }

  /** Solicita una confirmación explícita antes de transferir el grupo a otra persona. */
  async function transfer(userId: string, name: string) {
    if (
      await feedback.confirm({
        title: "Transferir liderazgo",
        description: `${name} liderará este grupo y tú pasarás a ser integrante.`,
        acceptLabel: "Transferir liderazgo",
      })
    )
      await run(() => messagingService.transfer(id, userId));
  }
  /** La expulsión conserva la membresía histórica y retira todas las pestañas del chat. */
  async function kick(userId: string, name: string) {
    if (
      await feedback.confirm({
        title: `¿Expulsar a ${name}?`,
        description: "Perderá acceso al grupo y a su conversación.",
        acceptLabel: "Expulsar integrante",
      })
    )
      await run(() => messagingService.kick(id, userId));
  }

  /** Un líder debe transferir antes de salir; el backend repite esta validación. */
  async function leave() {
    if (
      await feedback.confirm({
        title: "¿Salir del grupo?",
        description:
          "Dejarás de ver sus conversaciones, pero tu historial de pertenencia se conservará.",
        acceptLabel: "Salir del grupo",
      })
    ) {
      if (await run(() => messagingService.leave(id))) navigate("/grupos");
    }
  }

  if (group.isPending) return <Loading />;
  if (!group.data)
    return (
      <div className="spec04">
        <PageHeader title="Grupo no disponible" />
        <Notice error>
          {group.error?.message || "No encontramos ese grupo."}
        </Notice>
        <Link className="button secondary" to="/grupos">
          Volver a grupos
        </Link>
      </div>
    );
  const g = group.data,
    pending = g.pendingRequest;
  return (
    <div className="spec04">
      <PageHeader
        eyebrow={isLeader ? "LIDERAS ESTE GRUPO" : "APRENDE EN EQUIPO"}
        title={g.name}
        description={g.description || undefined}
        action={
          active ? (
            <Link className="button" to={`/mensajes/${id}`}>
              <MessageCircle size={18} />
              Abrir conversación
            </Link>
          ) : (
            <button
              className="button"
              disabled={pending || g.currentMembers >= g.maxCapacity}
              onClick={() => {
                setError("");
                setJoinOpen(true);
              }}
            >
              <Send size={16} />
              {pending
                ? "Solicitud pendiente"
                : g.currentMembers >= g.maxCapacity
                  ? "Grupo completo"
                  : g.myStatus === "kicked"
                    ? "Solicitar nuevo ingreso"
                    : "Solicitar ingreso"}
            </button>
          )
        }
      />
      <Notice error>{error}</Notice>
      <div className="editor-layout">
        {active ? (
          <div>
            {members.isPending ? (
              <Loading />
            ) : members.isError ? (
              <Notice error>{members.error.message}</Notice>
            ) : (
              <GroupMembersList
                members={members.data || []}
                isLeader={Boolean(isLeader)}
                currentUserId={user?.id || ""}
                busy={action.isPending}
                onTransfer={transfer}
                onKick={kick}
              />
            )}
          </div>
        ) : (
          <section className="panel spec04-join-invitation">
            <Users size={36} />
            <h2>Aprender es mejor en equipo.</h2>
            <p>
              {pending
                ? "Tu solicitud está pendiente de revisión por el líder."
                : "Solicita ingreso para conocer a los integrantes y participar en la conversación."}
            </p>
          </section>
        )}
        <aside className="panel spec04-group-about">
          <h2>Sobre el grupo</h2>
          <dl>
            <div>
              <dt>Curso</dt>
              <dd>{g.courseCode}</dd>
            </div>
            <div>
              <dt>Líder</dt>
              <dd>{g.leader.name}</dd>
            </div>
            <div>
              <dt>Modalidad</dt>
              <dd>{g.meetingMode}</dd>
            </div>
            <div>
              <dt>Turno</dt>
              <dd>
                {g.meetingShift === "manana"
                  ? "Mañana"
                  : g.meetingShift === "tarde"
                    ? "Tarde"
                    : "Noche"}
              </dd>
            </div>
            <div>
              <dt>Integrantes</dt>
              <dd>
                {g.currentMembers} de {g.maxCapacity}
              </dd>
            </div>
          </dl>
          {g.benefits && (
            <p>
              <strong>Beneficios</strong>
              <br />
              {g.benefits}
            </p>
          )}
          {g.requirements && (
            <p>
              <strong>Requisitos</strong>
              <br />
              {g.requirements}
            </p>
          )}
          {isLeader && (
            <Link className="button secondary full" to="/solicitudes">
              Revisar solicitudes
            </Link>
          )}
          {active && (
            <button
              className="button secondary danger full"
              disabled={Boolean(isLeader) || action.isPending}
              onClick={() => void leave()}
            >
              <LogOut size={16} />
              Salir del grupo
            </button>
          )}
          {isLeader && (
            <small className="muted">
              Para salir, primero transfiere el liderazgo a otro integrante
              activo.
            </small>
          )}
        </aside>
      </div>
      {joinOpen && (
        <Modal
          title="Solicitar ingreso al grupo"
          close={() => setJoinOpen(false)}
        >
          <form className="form" noValidate onSubmit={requestJoin}>
            <p>
              Preséntate a {g.leader.name} y cuéntale qué te gustaría aprender.
            </p>
            <Field
              label="Mensaje de presentación"
              hint="Opcional. Hasta 255 caracteres."
            >
              <textarea
                aria-label="Mensaje de presentación"
                value={message}
                maxLength={255}
                onChange={(event) => setMessage(event.target.value)}
              />
            </Field>
            <Notice error>{error}</Notice>
            <button className="button" disabled={join.isPending}>
              {join.isPending ? "Enviando…" : "Enviar solicitud"}
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={join.isPending}
              onClick={() => setJoinOpen(false)}
            >
              Cancelar
            </button>
          </form>
        </Modal>
      )}
      {success && (
        <Modal title="Solicitud enviada" close={() => setSuccess(false)}>
          <div className="spec04-success">
            <CheckCircle2 size={46} />
            <h3>Ya diste el primer paso.</h3>
            <p>
              El líder revisará tu solicitud. Podrás acceder al chat cuando te
              acepte.
            </p>
            <button className="button full" onClick={() => setSuccess(false)}>
              Entendido
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
