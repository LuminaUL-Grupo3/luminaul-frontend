import { useEffect, useState } from "react";
import { Empty } from "@/components/ui";
import { REVIEW_LIMITS, ReviewDto, UserReviewsSummaryDto } from "../types";
import { RatingStars } from "./RatingStars";
import { ReviewCard } from "./ReviewCard";

// Cuántas reseñas hay de cada cantidad de estrellas, de 5 a 1
function ratingDistribution(reviews: ReviewDto[]) {
  return Array.from({ length: REVIEW_LIMITS.MAX_RATING }, (_, i) => {
    const stars = REVIEW_LIMITS.MAX_RATING - i;
    return { stars, count: reviews.filter((r) => r.rating === stars).length };
  });
}

// Listado paginado con el resumen de satisfacción (promedio y barras por estrellas).
// Las reseñas del propio usuario (isMine) se pueden editar o eliminar, pero no reportar.
export function ReviewList({
  summary,
  pageSize = 5,
  emptyTitle = "Este usuario aún no tiene reseñas",
  emptyHint,
  isMine = () => false,
  onEdit,
  onDelete,
}: {
  summary: UserReviewsSummaryDto;
  pageSize?: number;
  emptyTitle?: string;
  emptyHint?: string;
  isMine?: (review: ReviewDto) => boolean;
  onEdit?: (review: ReviewDto) => void;
  onDelete?: (review: ReviewDto) => void;
}) {
  const reviews = summary.reviews ?? [],
    total = summary.totalReviews ?? reviews.length,
    pages = Math.max(1, Math.ceil(reviews.length / pageSize)),
    [page, setPage] = useState(1);

  // Si se borra la última reseña de la última página, se retrocede una página
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  if (!reviews.length) return <Empty title={emptyTitle}>{emptyHint}</Empty>;

  const visible = reviews.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="review-list">
      <div className="rating-summary">
        <div className="rating-average">
          <strong>{(summary.averageRating ?? 0).toFixed(1)}</strong>
          <RatingStars value={summary.averageRating ?? 0} size={16} />
          <span className="muted">
            {total} {total === 1 ? "reseña" : "reseñas"}
          </span>
        </div>
        <ul className="rating-bars" aria-label="Distribución de calificaciones">
          {ratingDistribution(reviews).map(({ stars, count }) => (
            <li key={stars}>
              <span>{stars} ★</span>
              <span className="rating-bar">
                <span style={{ width: `${(count / reviews.length) * 100}%` }} />
              </span>
              <span className="muted">{count}</span>
            </li>
          ))}
        </ul>
      </div>
      {visible.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          canModify={isMine(review)}
          canReport={!isMine(review)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {pages > 1 && (
        <nav className="review-pagination" aria-label="Páginas de reseñas">
          <button
            className="button secondary small"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>
          <span className="muted">
            Página {page} de {pages}
          </span>
          <button
            className="button secondary small"
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </nav>
      )}
    </div>
  );
}
