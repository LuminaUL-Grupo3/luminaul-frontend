import { useMemo, useState } from "react";
import { Check, GraduationCap, Inbox, RefreshCw, Search, Users, X } from "lucide-react";
import { Avatar, Empty, Loading, Notice, PageHeader } from "@/components/ui";
import { date } from "@/config/api";
import { useFeedback } from "@/hooks/useFeedback";
import {
  useDecideTutoringRequestMutation,
  useIncomingTutoringRequestsQuery,
} from "@/features/posts";
import { useJoinRequestsQuery } from "../hooks/useGroupQueries";
import { useJoinRequestDecision } from "../hooks/useJoinRequestDecision";
import { JoinRequestCard } from "../components/JoinRequestCard";
import "../styles/chat.css";

/** HU 2.2 separa consulta, presentación y decisión; los filtros no modifican estados del servidor. */
export function RequestsPage() {
  const feedback = useFeedback();
  const query = useJoinRequestsQuery();
  const tutoringQuery = useIncomingTutoringRequestsQuery();
  const decideTutoring = useDecideTutoringRequestMutation();
  const decision = useJoinRequestDecision(() => void query.refetch());
  const [search, setSearch] = useState(""),
    [groupId, setGroupId] = useState("");
  const requests = query.data || [];
  const tutoringRequests = tutoringQuery.data || [];
  const groups = useMemo(
    () => [
      ...new Map(
        (query.data || []).map((item) => [item.groupId, item.groupName]),
      ).entries(),
    ],
    [query.data],
  );
  const selectedGroup = groups.some(([id]) => id === groupId) ? groupId : "";
  const normalized = search.trim().toLocaleLowerCase("es");
  const filtered = requests.filter(
    (item) =>
      (!selectedGroup || item.groupId === selectedGroup) &&
      `${item.applicant.name} ${item.groupName}`
        .toLocaleLowerCase("es")
        .includes(normalized),
  );

  async function handleTutoringDecision(
    requestId: string,
    status: "accepted" | "rejected",
  ) {
    try {
      await decideTutoring.mutateAsync({ requestId, status });
      feedback.notify(
        status === "accepted"
          ? "Asesoría aceptada. Se creó la sala de chat 1 a 1."
          : "Solicitud de asesoría rechazada.",
      );
    } catch (err) {
      feedback.notify((err as Error).message);
    }
  }

  return (
    <div className="spec04">
      <PageHeader
        eyebrow="GESTIONAR COMUNIDAD"
        title="Solicitudes"
        description="Decide quién se une a los grupos que lideras y responde solicitudes de asesoría 1 a 1."
        action={
          <button
            className="button secondary"
            onClick={() => {
              void query.refetch();
              void tutoringQuery.refetch();
            }}
            disabled={query.isFetching || tutoringQuery.isFetching}
          >
            <RefreshCw
              size={16}
              className={
                query.isFetching || tutoringQuery.isFetching ? "spec04-spin" : ""
              }
            />{" "}
            Actualizar
          </button>
        }
      />
      <div className="spec04-request-summary">
        <span>
          <GraduationCap size={18} />
          <strong>{tutoringRequests.length}</strong>{" "}
          {tutoringRequests.length === 1
            ? "solicitud de asesoría"
            : "solicitudes de asesoría"}
        </span>
        <span>
          <Inbox size={18} />
          <strong>{requests.length}</strong>{" "}
          {requests.length === 1 ? "de grupo pendiente" : "de grupo pendientes"}
        </span>
        <span>
          <Users size={18} />
          <strong>{groups.length}</strong>{" "}
          {groups.length === 1
            ? "grupo con solicitudes"
            : "grupos con solicitudes"}
        </span>
      </div>
      <Notice error>
        {decision.error ||
          query.error?.message ||
          tutoringQuery.error?.message}
      </Notice>

      {tutoringRequests.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Solicitudes de asesoría (1 a 1)
          </h2>
          <div className="spec04-request-grid">
            {tutoringRequests.map((req) => (
              <article className="panel spec04-request-card" key={req.id}>
                <div className="spec04-request-head">
                  <div className="person">
                    <Avatar
                      name={req.applicant.name}
                      src={req.applicant.profilePhotoUrl ?? undefined}
                    />
                    <div>
                      <strong>{req.applicant.name}</strong>
                      <span>
                        {req.courseName} · {date(req.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="tag purple">Asesoría 1 a 1</span>
                </div>
                <p className="spec04-request-message">{req.message}</p>
                <div className="spec04-request-actions">
                  <button
                    className="button secondary"
                    disabled={decideTutoring.isPending}
                    onClick={() => void handleTutoringDecision(req.id, "rejected")}
                  >
                    <X size={16} /> Rechazar
                  </button>
                  <button
                    className="button"
                    disabled={decideTutoring.isPending}
                    onClick={() => void handleTutoringDecision(req.id, "accepted")}
                  >
                    <Check size={16} /> Aceptar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {requests.length > 0 && (
        <div className="spec04-request-filters">
          <label className="search-input">
            <Search size={17} />
            <input
              aria-label="Buscar solicitante o grupo"
              placeholder="Buscar por nombre o grupo"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <select
            aria-label="Filtrar solicitudes por grupo"
            value={selectedGroup}
            onChange={(event) => setGroupId(event.target.value)}
          >
            <option value="">Todos mis grupos</option>
            {groups.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}
      {query.isPending ? (
        <Loading />
      ) : filtered.length ? (
        <div className="spec04-request-grid">
          {filtered.map((request) => (
            <JoinRequestCard
              key={request.id}
              request={request}
              disabled={decision.pending}
              pending={decision.pendingId === request.id}
              pendingStatus={decision.pendingStatus}
              onDecide={decision.decide}
            />
          ))}
        </div>
      ) : (
        !query.isError && (
          <Empty
            title={
              requests.length
                ? "No hay solicitudes con estos filtros"
                : "No hay solicitudes pendientes por revisar"
            }
          >
            {requests.length ? (
              <button
                className="text-button"
                onClick={() => {
                  setSearch("");
                  setGroupId("");
                }}
              >
                Limpiar filtros
              </button>
            ) : (
              "Cuando alguien solicite unirse a tu grupo, aparecerá aquí."
            )}
          </Empty>
        )
      )}
    </div>
  );
}
