import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Empty, Loading, Notice, PageHeader } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { groupKeys, useJoinRequestsQuery } from "../hooks/useGroupQueries";
import { messagingService } from "../services/messagingService";
import type { JoinRequestDto } from "../types/contracts";
import "../styles/chat.css";

/** Conecta decisiones de liderazgo con el contrato aprobado/rechazado de SPEC-04. */
export function RequestsPage() {
  const query = useJoinRequestsQuery(),
    cache = useQueryClient(),
    feedback = useFeedback();
  const [error, setError] = useState("");
  const decision = useMutation({
    mutationFn: ({
      request,
      status,
    }: {
      request: JoinRequestDto;
      status: "approved" | "rejected";
    }) => messagingService.decide(request.groupId, request.id, status),
    onSuccess: async (result) => {
      feedback.notify(result.message);
      await cache.invalidateQueries({ queryKey: groupKeys.root });
    },
  });
  /** Bloquea dobles decisiones y deja al servidor resolver carreras por el último cupo. */
  async function decide(
    request: JoinRequestDto,
    status: "approved" | "rejected",
  ) {
    if (decision.isPending) return;
    setError("");
    try {
      await decision.mutateAsync({ request, status });
    } catch (cause) {
      setError((cause as Error).message);
      void query.refetch();
    }
  }
  return (
    <div className="spec04">
      <PageHeader
        eyebrow="GESTIONAR COMUNIDAD"
        title="Solicitudes de ingreso"
        description="Revisa quién quiere aprender con los grupos que lideras."
        action={
          <button
            className="button secondary"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            Actualizar
          </button>
        }
      />
      <Notice error>{error || query.error?.message}</Notice>
      {query.isPending ? (
        <Loading />
      ) : query.data?.length ? (
        <div className="stack">
          {query.data.map((request) => (
            <article
              className="join-request-card"
              key={request.id}
              data-request-id={request.id}
            >
              <div className="join-request-header">
                <div className="person">
                  <Avatar
                    name={request.applicant.name}
                    src={request.applicant.profilePhotoUrl || undefined}
                  />
                  <div>
                    <h3>{request.applicant.name}</h3>
                    <Link
                      className="text-button"
                      to={`/grupos/${request.groupId}`}
                    >
                      {request.groupName}
                    </Link>
                    <small className="muted">
                      {new Date(request.createdAt).toLocaleDateString("es-PE")}
                    </small>
                  </div>
                </div>
              </div>
              <p className="join-request-message">
                {request.message || "Sin mensaje de presentación."}
              </p>
              <div className="join-request-actions">
                <button
                  className="button secondary"
                  aria-label={`Rechazar solicitud de ${request.applicant.name}`}
                  disabled={decision.isPending}
                  onClick={() => void decide(request, "rejected")}
                >
                  Rechazar
                </button>
                <button
                  className="button"
                  aria-label={`Aceptar solicitud de ${request.applicant.name}`}
                  disabled={decision.isPending}
                  onClick={() => void decide(request, "approved")}
                >
                  {decision.isPending &&
                  decision.variables?.request.id === request.id
                    ? "Procesando…"
                    : "Aceptar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        !query.isError && (
          <Empty title="No hay solicitudes pendientes por revisar">
            Cuando alguien quiera unirse, verás su presentación aquí.
          </Empty>
        )
      )}
    </div>
  );
}
