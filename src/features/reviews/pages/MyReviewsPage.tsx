import { useState } from "react";
import { Empty, Loading, Notice, PageHeader } from "@/components/ui";
import { useMyReviewsQuery } from "../hooks/useReviewsQueries";
import { DeleteReviewConfirmModal, ReviewCard, ReviewFormModal } from "../components";
import { ReviewDto } from "../types";

// "Reseñas que escribí" (GET /reviews/me): el alumno revisa, edita (HU 5.3) o elimina (HU 5.4)
// sus reseñas. Tras cada cambio, las mutaciones invalidan la consulta y la lista se actualiza sola.
export function MyReviewsPage() {
  const reviews = useMyReviewsQuery(),
    [editing, setEditing] = useState<ReviewDto | null>(null),
    [deleting, setDeleting] = useState<ReviewDto | null>(null),
    written = reviews.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="CALIFICACIONES ENTRE ESTUDIANTES"
        title="Reseñas que escribí"
        description="Tus opiniones sobre los compañeros con los que compartiste un grupo de estudio."
      />
      <Notice error>{reviews.error?.message}</Notice>
      {reviews.isLoading ? (
        <Loading />
      ) : (
        <section className="panel">
          {written.length ? (
            <div className="review-list">
              {written.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showReviewedUser
                  canModify
                  canReport={false}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          ) : (
            <Empty title="Aún no escribiste reseñas">
              Puedes calificar a un compañero desde su perfil si estudiaron juntos en un grupo.
            </Empty>
          )}
        </section>
      )}
      {editing && (
        <ReviewFormModal
          reviewedUserId={editing.reviewedUserId}
          reviewedUserName={editing.reviewedUser.name}
          review={editing}
          close={() => setEditing(null)}
          onSaved={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteReviewConfirmModal
          review={deleting}
          close={() => setDeleting(null)}
          onDeleted={() => setDeleting(null)}
        />
      )}
    </>
  );
}
