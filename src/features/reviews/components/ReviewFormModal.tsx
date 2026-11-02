import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Field, Modal, Notice } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { useCreateReviewMutation, useUpdateReviewMutation } from "../hooks/useReviewMutations";
import { REVIEW_LIMITS, ReviewDto } from "../types";
import { RatingStars } from "./RatingStars";

// Mismas validaciones de forma que CreateReviewDto, con los mensajes de las HU 5.1 y 5.3;
// las reglas de negocio las aplica el backend
export function validateReview(rating: number, comment: string): string {
  if (!Number.isInteger(rating) || rating < REVIEW_LIMITS.MIN_RATING || rating > REVIEW_LIMITS.MAX_RATING)
    return "Debe seleccionar una calificación";
  if (!comment.trim()) return "Debe ingresar un comentario";
  if (comment.trim().length > REVIEW_LIMITS.MAX_COMMENT_LENGTH)
    return "El comentario no puede superar los 1000 caracteres";
  return "";
}

// Diálogo para escribir una reseña o, si recibe `review`, editarla
export function ReviewFormModal({
  reviewedUserId,
  reviewedUserName,
  review,
  close,
  onSaved,
}: {
  reviewedUserId: string;
  reviewedUserName?: string;
  review?: ReviewDto | null;
  close: () => void;
  onSaved: () => void;
}) {
  const feedback = useFeedback(),
    create = useCreateReviewMutation(),
    update = useUpdateReviewMutation(),
    [rating, setRating] = useState(review?.rating ?? 0),
    [comment, setComment] = useState(review?.comment ?? ""),
    [validation, setValidation] = useState(""),
    busy = create.isPending || update.isPending;

  const saved = (message: string) => () => {
    feedback.notify(message);
    onSaved();
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const error = validateReview(rating, comment);
    setValidation(error);
    if (error || busy) return;
    if (review)
      update.mutate(
        { reviewId: review.id, payload: { rating, comment: comment.trim() } },
        { onSuccess: saved("Reseña actualizada con éxito") },
      );
    else
      create.mutate(
        { reviewedUserId, rating, comment: comment.trim() },
        { onSuccess: saved("Reseña publicada con éxito") },
      );
  }

  return (
    <Modal
      title={review ? "Editar reseña" : `Calificar a ${reviewedUserName || "tu compañero"}`}
      close={close}
    >
      <form className="form" onSubmit={submit} noValidate>
        {/* div y no <label>: un label con botones adentro marcaría la primera estrella al hacer clic */}
        <div className="field">
          <span>Calificación</span>
          <RatingStars value={rating} onChange={setRating} size={28} label="Calificación" />
        </div>
        <Field
          label="Comentario"
          hint={`${comment.length}/${REVIEW_LIMITS.MAX_COMMENT_LENGTH} caracteres`}
        >
          <textarea
            value={comment}
            maxLength={REVIEW_LIMITS.MAX_COMMENT_LENGTH}
            placeholder="¿Cómo fue estudiar con esta persona?"
            onChange={(e) => setComment(e.target.value)}
          />
        </Field>
        <Notice error>{validation || create.error?.message || update.error?.message}</Notice>
        <button className="button" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={18} /> : null}
          {busy ? "Guardando…" : review ? "Guardar cambios" : "Publicar reseña"}
        </button>
        <button type="button" className="button secondary" onClick={close} disabled={busy}>
          Cancelar
        </button>
      </form>
    </Modal>
  );
}
