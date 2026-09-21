import { Link } from "react-router-dom";
import { Check, X, LoaderCircle, Users } from "lucide-react";
import { JoinRequestItem, date } from "./api";
import { Avatar } from "./ui";

interface JoinRequestCardProps {
  request: JoinRequestItem;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
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
            <Users size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            {group.group_name} · {date(created_at)}
          </span>
        </div>
      </div>

      <div style={{ margin: "12px 0" }}>
        <p style={{ margin: 0, color: "#374151" }}>
          {message ? `"${message}"` : <em className="muted">Sin mensaje adjunto</em>}
        </p>
      </div>

      <div className="two-cols" style={{ marginTop: "16px" }}>
        <button
          type="button"
          className="button"
          disabled={isProcessing}
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
          disabled={isProcessing}
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
