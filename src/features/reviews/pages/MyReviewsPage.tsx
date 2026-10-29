import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { api } from "@/config/api";
import { useFeedback } from "@/hooks/useFeedback";
import { useResource } from "@/hooks/useResource";
import {
  PageHeader,
  Loading,
  Notice,
  Empty,
  Modal,
  Field,
  ActionForm,
} from "@/components/ui";
import { Review } from "../types";

export function MyReviewsPage() {
  const feedback = useFeedback();
  const reviews = useResource<Review[]>("/reviews/me", []),
    [edit, setEdit] = useState<Review | null>(null),
    [error, setError] = useState("");

  return (
    <>
      <PageHeader
        title="Reseñas que escribí"
        description="Tu experiencia ayuda a otros estudiantes a conectar."
      />
      <Notice error>{reviews.error || error}</Notice>
      {reviews.loading ? (
        <Loading />
      ) : reviews.data.length ? (
        <div className="stack">
          {reviews.data.map((r) => (
            <article className="panel" key={r.id}>
              <Link to={`/perfil/${r.reviewed_user_id}`}>
                <h3>{r.target_name}</h3>
              </Link>
              <span className="rating">{"★".repeat(r.rating)}</span>
              <p>{r.comment}</p>
              <span className="tag">
                {r.status === "published" ? "Publicada" : "Moderada"}
              </span>
              <div className="button-row">
                <button className="text-button" onClick={() => setEdit(r)}>
                  <Pencil size={15} />
                  Editar
                </button>
                <button
                  className="text-button danger"
                  onClick={async () => {
                    if (
                      !(await feedback.confirm({
                        title: "¿Eliminar esta reseña?",
                        description: `Tu reseña sobre ${r.target_name} dejará de mostrarse en su perfil.`,
                        acceptLabel: "Eliminar reseña",
                      }))
                    )
                      return;
                    try {
                      await api.request(`/reviews/${r.id}`, "DELETE");
                      setError("");
                      feedback.notify("Reseña eliminada con éxito");
                      reviews.reload();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  <Trash2 size={15} />
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty title="Aún no escribiste reseñas" />
      )}
      {edit && (
        <Modal title="Editar reseña" close={() => setEdit(null)}>
          <ActionForm
            path={`/reviews/${edit.id}`}
            method="PUT"
            payload={() => ({ rating: edit.rating, comment: edit.comment })}
            label="Guardar cambios"
            cancel={() => setEdit(null)}
            validate={() =>
              !edit.comment.trim()
                ? "Debe ingresar un comentario"
                : !Number.isInteger(edit.rating) ||
                    edit.rating < 1 ||
                    edit.rating > 5
                  ? "Debe seleccionar una calificación entre 1 y 5"
                  : ""
            }
            done={() => {
              setEdit(null);
              reviews.reload();
            }}
          >
            <Field label="Calificación">
              <input
                type="number"
                min={1}
                max={5}
                value={edit.rating}
                onChange={(e) =>
                  setEdit({ ...edit, rating: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Comentario">
              <textarea
                required
                maxLength={2000}
                value={edit.comment}
                onChange={(e) => setEdit({ ...edit, comment: e.target.value })}
              />
            </Field>
          </ActionForm>
        </Modal>
      )}
    </>
  );
}
