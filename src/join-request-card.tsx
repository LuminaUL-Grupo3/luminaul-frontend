import { Link } from "react-router-dom";
import { Check, X, LoaderCircle, Users } from "lucide-react";
import { JoinRequestItem, date } from "./api";
import { Avatar } from "./ui";

interface JoinRequestCardProps {
  request: JoinRequestItem;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

/**
 * Componente JoinRequestCard (Tarea H.U. 2.2):
 * Muestra los datos de una solicitud de unión pendiente:
 * - Nombre y avatar del solicitante (con enlace a su perfil)
 * - Grupo relacionado
 * - Fecha de creación
 * - Mensaje o motivo adjunto
 * - Botones "Aceptar" y "Rechazar" con bloqueo durante procesamiento
 */
export function JoinRequestCard({
  request,
  onAccept,
  onReject,
  isProcessing,
  disabled = false,
}: JoinRequestCardProps) {
  const { requester, group, message, created_at } = request;

  return (
    <article className="panel join-request-card" key={request.id}>
      <div className="person">
        <Avatar name={requester.name} src={requester.profile_photo_url || undefined} />
        <div>
          <Link to={`/perfil/${requester.user_id}`}>
            <strong>{requester.name}</strong>
          </Link>
          <span className="muted">
            <Users size={14} className="request-group-icon" />
            <Link to={`/grupos/${group.group_id}`}>{group.group_name}</Link> · {date(created_at)}
          </span>
        </div>
      </div>

      <div className="request-message">
        <p>
          {message ? `"${message}"` : <em className="muted">Sin mensaje adjunto</em>}
        </p>
      </div>

      <div className="two-cols request-actions">
        <button
          type="button"
          className="button"
          disabled={isProcessing || disabled}
          onClick={() => onAccept(request.id)}
          aria-label={`Aceptar solicitud de ${requester.name}`}
        >
          {isProcessing ? (
            <>
              <LoaderCircle className="spin" size={16} /> Procesando...
            </>
          ) : (
            <>
              <Check size={16} /> Aceptar
            </>
          )}
        </button>
        <button
          type="button"
          className="button secondary danger"
          disabled={isProcessing || disabled}
          onClick={() => onReject(request.id)}
          aria-label={`Rechazar solicitud de ${requester.name}`}
        >
          {isProcessing ? (
            <>
              <LoaderCircle className="spin" size={16} /> Procesando...
            </>
          ) : (
            <>
              <X size={16} /> Rechazar
            </>
          )}
        </button>
      </div>
    </article>
  );
}
