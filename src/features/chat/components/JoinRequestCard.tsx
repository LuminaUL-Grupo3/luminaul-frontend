import { JoinRequestItem } from "../types";
import { Avatar } from "../../../components/ui";
import { date } from "../../../config/api";

interface JoinRequestCardProps {
  request: JoinRequestItem;
  isProcessing: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function JoinRequestCard({
  request,
  isProcessing,
  onAccept,
  onReject,
}: JoinRequestCardProps) {
  const requesterName = request.requester.name || "Usuario desconocido";
  const groupName = request.group.group_name || "Grupo de estudio";
  const message = request.message || "Sin mensaje de presentación";

  return (
    <article className="join-request-card" data-request-id={request.id}>
      <div className="join-request-header">
        <div className="join-request-user-info">
          <Avatar
            name={requesterName}
            src={request.requester.profile_photo_url || undefined}
          />
          <div>
            <h4 className="requester-name">{requesterName}</h4>
            <span className="join-request-group-target">
              Desea unirse a: <strong>{groupName}</strong>
            </span>
            <span className="join-request-date">{date(request.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="join-request-body">
        <p className="join-request-message">
          <span className="quote-mark">“</span>
          {message}
          <span className="quote-mark">”</span>
        </p>
      </div>

      <footer className="join-request-actions">
        <button
          type="button"
          className="button secondary small"
          disabled={isProcessing}
          onClick={() => onReject(request.id)}
          aria-label={`Rechazar solicitud de ${requesterName}`}
        >
          {isProcessing ? "Procesando…" : "Rechazar"}
        </button>
        <button
          type="button"
          className="button primary small"
          disabled={isProcessing}
          onClick={() => onAccept(request.id)}
          aria-label={`Aceptar solicitud de ${requesterName}`}
        >
          {isProcessing ? "Procesando…" : "Aceptar"}
        </button>
      </footer>
    </article>
  );
}
