import { useMemo, useState } from "react";
import { Inbox, RefreshCw, Search, Users } from "lucide-react";
import { Empty, Loading, Notice, PageHeader } from "@/components/ui";
import { useJoinRequestsQuery } from "../hooks/useGroupQueries";
import { useJoinRequestDecision } from "../hooks/useJoinRequestDecision";
import { JoinRequestCard } from "../components/JoinRequestCard";
import "../styles/chat.css";

/** HU 2.2 separa consulta, presentación y decisión; los filtros no modifican estados del servidor. */
export function RequestsPage() {
  const query = useJoinRequestsQuery();
  const decision = useJoinRequestDecision(() => void query.refetch());
  const [search, setSearch] = useState(""),
    [groupId, setGroupId] = useState("");
  const requests = query.data || [];
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
  return (
    <div className="spec04">
      <PageHeader
        eyebrow="GESTIONAR COMUNIDAD"
        title="Solicitudes de ingreso"
        description="Decide quién se une a los grupos que lideras."
        action={
          <button
            className="button secondary"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw
              size={16}
              className={query.isFetching ? "spec04-spin" : ""}
            />{" "}
            Actualizar
          </button>
        }
      />
      <div className="spec04-request-summary">
        <span>
          <Inbox size={18} />
          <strong>{requests.length}</strong>{" "}
          {requests.length === 1 ? "pendiente" : "pendientes"}
        </span>
        <span>
          <Users size={18} />
          <strong>{groups.length}</strong>{" "}
          {groups.length === 1
            ? "grupo con solicitudes"
            : "grupos con solicitudes"}
        </span>
      </div>
      <Notice error>{decision.error || query.error?.message}</Notice>
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
