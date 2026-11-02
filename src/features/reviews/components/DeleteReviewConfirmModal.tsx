import { Modal, Notice } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { useDeleteReviewMutation } from "../hooks/useReviewMutations";
import { ReviewDto } from "../types";

// Confirmación antes de retirar una reseña (DELETE con borrado lógico en el backend)
export function DeleteReviewConfirmModal({
  review,
  close,
  onDeleted,
}: {
  review: ReviewDto;
  close: () => void;
  onDeleted: () => void;
}) {
  const feedback = useFeedback(),
    remove = useDeleteReviewMutation();

  function confirm() {
    remove.mutate(review.id, {
      onSuccess: (result) => {
        feedback.notify(result.message);
        onDeleted();
      },
    });
  }

  return (
    <Modal title="¿Eliminar esta reseña?" close={close}>
      <p>
        La reseña dejará de mostrarse en el perfil del estudiante. Luego podrás escribir una
        nueva si lo deseas.
      </p>
      <Notice error>{remove.error?.message}</Notice>
      <div className="modal-actions">
        <button
          type="button"
          className="button secondary"
          autoFocus
          disabled={remove.isPending}
          onClick={close}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="button danger-button"
          disabled={remove.isPending}
          onClick={confirm}
        >
          {remove.isPending ? "Eliminando…" : "Eliminar reseña"}
        </button>
      </div>
    </Modal>
  );
}
