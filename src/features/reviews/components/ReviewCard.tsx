import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { date } from "@/config/api";
import { Avatar, ReportButton } from "@/components/ui";
import { ReviewDto } from "../types";
import { RatingStars } from "./RatingStars";

// Tarjeta de una reseña: estrellas, autor, fecha, texto y botón "Reportar" (HU 5.2).
// En "Reseñas que escribí" muestra al estudiante calificado en lugar del autor.
// Editar y Eliminar solo aparecen para el autor (HU 5.3 y 5.4); el backend responde 403 a otros.
export function ReviewCard({
  review,
  showReviewedUser = false,
  canModify = false,
  canReport = true,
  onEdit,
  onDelete,
}: {
  review: ReviewDto;
  showReviewedUser?: boolean;
  canModify?: boolean;
  canReport?: boolean;
  onEdit?: (review: ReviewDto) => void;
  onDelete?: (review: ReviewDto) => void;
}) {
  const person = showReviewedUser ? review.reviewedUser : review.reviewer,
    edited = review.updatedAt !== review.createdAt;
  return (
    <article className="review review-card">
      <div className="section-title">
        <Link to={`/perfil/${person.id}`} className="review-author">
          <Avatar name={person.name} src={person.profilePhotoUrl ?? undefined} />
          <strong>
            {showReviewedUser && "Para "}
            {person.name || "Estudiante"}
          </strong>
        </Link>
        {canReport && <ReportButton kind="review" id={review.id} />}
      </div>
      <RatingStars value={review.rating} size={14} />
      <p>{review.comment}</p>
      <small className="muted">
        {date(review.createdAt)}
        {edited && " · editada"}
        {review.status === "hidden" && " · oculta por moderación"}
      </small>
      {canModify && (
        <div className="button-row">
          <button className="text-button" onClick={() => onEdit?.(review)}>
            <Pencil size={15} />
            Editar
          </button>
          <button className="text-button danger" onClick={() => onDelete?.(review)}>
            <Trash2 size={15} />
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}
