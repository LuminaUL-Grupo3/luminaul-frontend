import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Star } from "lucide-react";
import { useSession } from "@/features/auth";
import { Loading, Notice } from "@/components/ui";
import {
  emptyReviewsSummary,
  useReviewEligibilityQuery,
  useUserReviewsQuery,
} from "../hooks/useReviewsQueries";
import { ReviewDto } from "../types";
import { ReviewList } from "./ReviewList";
import { ReviewFormModal } from "./ReviewFormModal";
import { DeleteReviewConfirmModal } from "./DeleteReviewConfirmModal";

// Bloque "Reseñas recibidas" listo para insertar en el perfil (SPEC-02), sin ruta propia:
//   <UserReviewsSection userId={id} userName={nombre} />
// Muestra promedio y reseñas (HU 5.2), "Publicar reseña" solo si el backend lo permite (HU 5.1)
// y deja al autor editar o eliminar la suya (HU 5.3 y 5.4). Tras cada cambio, las mutaciones
// invalidan las consultas y el bloque se actualiza solo.
export function UserReviewsSection({ userId, userName }: { userId: string; userName?: string }) {
  const { user } = useSession(),
    own = userId === user?.id,
    summary = useUserReviewsQuery(userId),
    eligibility = useReviewEligibilityQuery(userId, !own),
    [form, setForm] = useState<{ review: ReviewDto | null } | null>(null),
    [deleting, setDeleting] = useState<ReviewDto | null>(null);

  const data = summary.data ?? emptyReviewsSummary(userId),
    isMine = (review: ReviewDto) => review.reviewerId === user?.id,
    myReview = data.reviews.find(isMine);

  let action = null;
  if (own) {
    action = (
      <Link className="text-button" to="/mis-resenas">
        Las que escribí
      </Link>
    );
  } else if (myReview) {
    action = (
      <button className="text-button" onClick={() => setForm({ review: myReview })}>
        <Pencil size={15} />
        Editar mi reseña
      </button>
    );
  } else if (eligibility.data?.allowed) {
    action = (
      <button className="button small" onClick={() => setForm({ review: null })}>
        <Star size={15} />
        Publicar reseña
      </button>
    );
  }

  return (
    <div className="panel">
      <div className="section-title">
        <h2>Reseñas recibidas</h2>
        {action}
      </div>
      <Notice error>{summary.error?.message}</Notice>
      {/* HU 5.1 E2 y E5: en lugar del botón se explica por qué no puede calificar */}
      {!own && eligibility.data?.allowed === false && <Notice>{eligibility.data.reason}</Notice>}
      {summary.isLoading ? (
        <Loading />
      ) : (
        <ReviewList
          summary={data}
          emptyTitle={own ? "Aún no recibiste reseñas" : undefined}
          emptyHint={
            own ? "Cuando un compañero de grupo te califique, su opinión aparecerá aquí." : undefined
          }
          isMine={isMine}
          onEdit={(review) => setForm({ review })}
          onDelete={setDeleting}
        />
      )}
      {form && (
        <ReviewFormModal
          reviewedUserId={userId}
          reviewedUserName={userName}
          review={form.review}
          close={() => setForm(null)}
          onSaved={() => setForm(null)}
        />
      )}
      {deleting && (
        <DeleteReviewConfirmModal
          review={deleting}
          close={() => setDeleting(null)}
          onDeleted={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
