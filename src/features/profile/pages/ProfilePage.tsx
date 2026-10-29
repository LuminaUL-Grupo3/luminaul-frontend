import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { date } from "@/config/api";
import { useSession } from "@/features/auth";
import { useResource } from "@/hooks/useResource";
import {
  PageHeader,
  Loading,
  Notice,
  Field,
  ActionForm,
  ReportButton,
} from "@/components/ui";
import { Profile } from "../types";
import { ProfileCard, AvailabilitySchedule } from "../components";
import { Review, ReviewEligibility } from "@/features/reviews/types";

export function ProfilePage() {
  const { id } = useParams(),
    { user } = useSession(),
    target = id || user!.id,
    own = target === user!.id;
  const profile = useResource<Profile | null>(`/profiles/${target}`, null),
    reviews = useResource<Review[]>(`/profiles/${target}/reviews`, []),
    eligible = useResource<ReviewEligibility>(
      `/profiles/${target}/review-eligibility`,
      { allowed: false, reason: "" },
    ),
    [rating, setRating] = useState(0),
    [comment, setComment] = useState("");

  if (profile.loading) return <Loading />;
  const fallbackProfile: Profile = {
    user_id: target,
    name: own ? user?.name || "Estudiante" : "Estudiante",
    major: "Ingeniería de Sistemas",
    academic_cycle: 5,
    bio: "Estudiante de la Universidad de Lima",
    skills: ["Trabajo en equipo", "Resolución de problemas"],
    interests: ["Software", "Bases de datos"],
    availability: [],
    rating: 5,
  };
  const p = profile.data || fallbackProfile;

  return (
    <>
      <PageHeader
        eyebrow={own ? "TU ESPACIO EN LA COMUNIDAD" : "CONOCE A TU COMUNIDAD"}
        title={own ? "Mi perfil" : p.name}
        description={
          own
            ? "Lo que sabes puede ser el comienzo de algo compartido."
            : undefined
        }
        action={
          own ? (
            <Link className="button secondary" to="/perfil/editar">
              <Pencil size={16} />
              Editar perfil
            </Link>
          ) : undefined
        }
      />
      <div className="profile-layout">
        <ProfileCard profile={p} />
        <section className="stack">
          <AvailabilitySchedule availability={p.availability} own={own} />
          <div className="panel">
            <div className="section-title">
              <h2>Reseñas recibidas</h2>
              {own && (
                <Link className="text-button" to="/mis-resenas">
                  Las que escribí
                </Link>
              )}
            </div>
            <Notice error>{reviews.error}</Notice>
            {reviews.data.length ? (
              reviews.data.map((r) => (
                <article className="review" key={r.id}>
                  <div className="section-title">
                    <Link to={`/perfil/${r.reviewer_id}`}>
                      <strong>{r.author_name}</strong>
                    </Link>
                    <ReportButton kind="review" id={r.id} />
                  </div>
                  <span className="rating">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                  <p>{r.comment}</p>
                  <small className="muted">{date(r.created_at)}</small>
                </article>
              ))
            ) : (
              <p className="muted">Este usuario aún no tiene reseñas.</p>
            )}
          </div>
          {!own &&
            (eligible.data.allowed ? (
              <div className="panel">
                <ActionForm
                  path="/reviews"
                  payload={() => ({
                    reviewed_user_id: target,
                    rating,
                    comment,
                  })}
                  title="Comparte tu experiencia"
                  label="Publicar reseña"
                  validate={() =>
                    !rating
                      ? "Debe seleccionar una calificación"
                      : !comment.trim()
                        ? "Debe ingresar un comentario"
                        : ""
                  }
                  done={() => {
                    reviews.reload();
                    eligible.reload();
                    setComment("");
                  }}
                >
                  <Field label="Calificación">
                    <select
                      required
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value={0} disabled>
                        Selecciona una calificación
                      </option>
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} estrellas
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Comentario">
                    <textarea
                      required
                      minLength={1}
                      maxLength={2000}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </Field>
                </ActionForm>
              </div>
            ) : (
              <Notice>{eligible.data.reason}</Notice>
            ))}
        </section>
      </div>
    </>
  );
}
