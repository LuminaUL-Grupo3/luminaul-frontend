import { Link } from "react-router-dom";
import { Check, X, LoaderCircle, CalendarDays } from "lucide-react";
import { Avatar } from "@/components/ui";
import type { JoinRequestDto } from "../types/contracts";

interface Props {
  request: JoinRequestDto;
  disabled: boolean;
  pending: boolean;
  pendingStatus?: "approved" | "rejected";
  onDecide: (
    request: JoinRequestDto,
    status: "approved" | "rejected",
  ) => Promise<void>;
}
/** Tarjeta de postulación: muestra el contexto antes de las dos acciones de HU 2.2. */
export function JoinRequestCard({
  request,
  disabled,
  pending,
  pendingStatus,
  onDecide,
}: Props) {
  return (
    <article
      className="join-request-card spec04-request-card"
      data-request-id={request.id}
      aria-busy={pending}
    >
      <div className="spec04-request-person">
        <Avatar
          name={request.applicant.name}
          src={request.applicant.profilePhotoUrl || undefined}
        />
        <div>
          <h3>{request.applicant.name}</h3>
          <Link className="text-button" to={`/grupos/${request.groupId}`}>
            {request.groupName}
          </Link>
          <time dateTime={request.createdAt}>
            <CalendarDays size={12} />
            {new Date(request.createdAt).toLocaleDateString("es-PE", {
              day: "numeric",
              month: "long",
            })}
          </time>
        </div>
        <span className="spec04-pending-tag">Pendiente</span>
      </div>
      <p className="spec04-request-message">
        {request.message || "Sin mensaje de presentación."}
      </p>
      <div className="spec04-request-footer">
        <small>La decisión se comunicará al solicitante.</small>
        <div className="button-row">
          <button
            className="button secondary"
            aria-label={`Rechazar solicitud de ${request.applicant.name}`}
            disabled={disabled}
            onClick={() => void onDecide(request, "rejected")}
          >
            {pending && pendingStatus === "rejected" ? (
              <LoaderCircle className="spec04-spin" size={16} />
            ) : (
              <X size={16} />
            )}
            {pending && pendingStatus === "rejected"
              ? "Rechazando…"
              : "Rechazar"}
          </button>
          <button
            className="button"
            aria-label={`Aceptar solicitud de ${request.applicant.name}`}
            disabled={disabled}
            onClick={() => void onDecide(request, "approved")}
          >
            {pending && pendingStatus === "approved" ? (
              <LoaderCircle className="spec04-spin" size={16} />
            ) : (
              <Check size={16} />
            )}
            {pending && pendingStatus === "approved" ? "Aceptando…" : "Aceptar"}
          </button>
        </div>
      </div>
    </article>
  );
}
