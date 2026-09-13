import { useState, FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, Star, Calendar, Plus, Trash2, Camera } from "lucide-react";
import { api, Profile, Review, Availability, days, date } from "./api";
import { useSession } from "./session";
import { useFeedback } from "./feedback";
import {
  useResource,
  PageHeader,
  Loading,
  Notice,
  Empty,
  Avatar,
  Field,
  Modal,
  ActionForm,
  ReportButton,
} from "./ui";
export function ProfilePage() {
  const { id } = useParams(),
    { user } = useSession(),
    target = id || user!.id,
    own = target === user!.id;
  const profile = useResource<Profile | null>(`/profiles/${target}`, null),
    reviews = useResource<Review[]>(`/profiles/${target}/reviews`, []),
    eligible = useResource<{ allowed: boolean; reason: string }>(
      `/profiles/${target}/review-eligibility`,
      { allowed: false, reason: "" },
    ),
    [rating, setRating] = useState(0),
    [comment, setComment] = useState("");
  if (profile.loading) return <Loading />;
  if (!profile.data) return <Notice error>{profile.error}</Notice>;
  const p = profile.data;
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
        <aside className="panel profile-card">
          <div className="profile-cover" />
          <Avatar name={p.name} src={p.photo_url} large />
          <h2>{p.name}</h2>
          <p>
            {p.major} · Ciclo {p.academic_cycle}
          </p>
          <span className="rating">
            <Star size={17} />
            {p.rating ? `${p.rating} de 5` : "Aún sin calificaciones"}
          </span>
          <p className="bio">{p.bio || "Todavía no agregó una descripción."}</p>
          <h4>Habilidades</h4>
          <div className="tags">
            {p.skills.map((s) => (
              <span className="tag" key={s}>
                {s}
              </span>
            ))}
          </div>
          <h4>Intereses</h4>
          <div className="tags">
            {p.interests.map((s) => (
              <span className="course-tag" key={s}>
                {s}
              </span>
            ))}
          </div>
        </aside>
        <section className="stack">
          <div className="panel">
            <div className="section-title">
              <h2>
                <Calendar size={20} />
                Disponibilidad
              </h2>
              {own && (
                <Link className="text-button" to="/horario">
                  Gestionar horario
                </Link>
              )}
            </div>
            {p.availability.length ? (
              <div className="availability-list">
                {p.availability.map((a) => (
                  <div key={a.id}>
                    <strong>{days[a.day_of_week - 1]}</strong>
                    <span>
                      {a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Todavía no hay horas libres registradas.</p>
            )}
          </div>
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
export function EditProfilePage() {
  const resource = useResource<Profile | null>("/profiles/me", null);
  return (
    <>
      <PageHeader eyebrow="CUÉNTALE A TU COMUNIDAD" title="Editar mi perfil" />
      <Notice error>{resource.error}</Notice>
      {resource.loading ? (
        <Loading />
      ) : resource.data ? (
        <ProfileForm profile={resource.data} />
      ) : null}
    </>
  );
}
function ProfileForm({ profile }: { profile: Profile }) {
  const { user, setUser } = useSession(),
    [form, setForm] = useState(profile),
    [skills, setSkills] = useState(profile.skills.join(", ")),
    [interests, setInterests] = useState(profile.interests.join(", ")),
    [photoError, setPhotoError] = useState(""),
    [uploading, setUploading] = useState(false);
  return (
    <div className="panel narrow">
      <div className="photo-edit">
        <Avatar large name={form.name} src={form.photo_url} />
        <label className="button secondary">
          <Camera size={18} />
          {uploading ? "Subiendo…" : "Cambiar foto"}
          <input
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setPhotoError("");
              try {
                if (file.size > 2 * 1024 * 1024)
                  throw new Error("La imagen debe pesar menos de 2 MB");
                const data = new FormData();
                data.append("photo", file);
                const r = await api.request<{ photo_url: string }>(
                  "/profiles/me/photo",
                  "POST",
                  data,
                );
                setForm({ ...form, photo_url: r.photo_url });
              } catch (e) {
                setPhotoError((e as Error).message);
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
      </div>
      <Notice error>{photoError}</Notice>
      <ActionForm
        path="/profiles/me"
        method="PUT"
        payload={() => ({
          name: form.name,
          bio: form.bio,
          major: form.major,
          academic_cycle: form.academic_cycle,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          interests: interests
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        })}
        label="Guardar perfil"
        done={() => setUser({ ...user!, name: form.name })}
      >
        <Field label="Nombre completo">
          <input
            required
            minLength={2}
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Descripción personal">
          <textarea
            maxLength={1500}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </Field>
        <div className="two-cols">
          <Field label="Carrera">
            <input
              required
              minLength={2}
              maxLength={100}
              value={form.major}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
            />
          </Field>
          <Field label="Ciclo académico">
            <input
              type="number"
              min={1}
              max={10}
              required
              value={form.academic_cycle}
              onChange={(e) =>
                setForm({ ...form, academic_cycle: Number(e.target.value) })
              }
            />
          </Field>
        </div>
        <Field label="Habilidades" hint="Separa con comas. Máximo 15.">
          <input value={skills} onChange={(e) => setSkills(e.target.value)} />
        </Field>
        <Field label="Intereses" hint="Separa con comas. Máximo 15.">
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </Field>
      </ActionForm>
      <Link to="/perfil" className="text-button">
        Volver a mi perfil
      </Link>
    </div>
  );
}
export function AvailabilityPage() {
  const feedback = useFeedback();
  const resource = useResource<Profile | null>("/profiles/me", null),
    [edit, setEdit] = useState<Availability | null>(null),
    [open, setOpen] = useState(false),
    [error, setError] = useState("");
  return (
    <>
      <PageHeader
        eyebrow="HAGAMOS TIEMPO PARA APRENDER"
        title="Mi horario disponible"
        description="Comparte tus horas libres. Nadie puede modificar tu horario."
        action={
          <button
            className="button"
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            <Plus size={18} />
            Agregar franja
          </button>
        }
      />
      <Notice error>{resource.error || error}</Notice>
      {resource.loading ? (
        <Loading />
      ) : (
        <div className="week-grid">
          {days.map((d, i) => (
            <section className="day-card" key={d}>
              <h3>{d}</h3>
              {resource.data?.availability
                .filter((a) => a.day_of_week === i + 1)
                .map((a) => (
                  <div className="time-slot" key={a.id}>
                    <strong>
                      {a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)}
                    </strong>
                    <div>
                      <button
                        className="icon-button"
                        title="Editar franja"
                        onClick={() => {
                          setEdit(a);
                          setOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-button danger"
                        title="Eliminar franja"
                        onClick={async () => {
                          if (
                            !(await feedback.confirm({
                              title: "¿Eliminar esta franja?",
                              description: `${d}, de ${a.start_time.slice(0, 5)} a ${a.end_time.slice(0, 5)}. Dejará de aparecer en tu horario disponible.`,
                              acceptLabel: "Eliminar franja",
                            }))
                          )
                            return;
                          try {
                            await api.request(
                              `/availability/${a.id}`,
                              "DELETE",
                            );
                            setError("");
                            feedback.notify("Franja eliminada correctamente");
                            resource.reload();
                          } catch (e) {
                            setError((e as Error).message);
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              {!resource.data?.availability.some(
                (a) => a.day_of_week === i + 1,
              ) && <p className="muted">Sin franjas</p>}
            </section>
          ))}
        </div>
      )}
      {open && (
        <AvailabilityModal
          edit={edit}
          close={() => setOpen(false)}
          done={() => {
            setOpen(false);
            resource.reload();
          }}
        />
      )}
    </>
  );
}
function AvailabilityModal({
  edit,
  close,
  done,
}: {
  edit: Availability | null;
  close: () => void;
  done: () => void;
}) {
  const [day, setDay] = useState(edit?.day_of_week || 1),
    [start, setStart] = useState(edit?.start_time.slice(0, 5) || "10:00"),
    [end, setEnd] = useState(edit?.end_time.slice(0, 5) || "12:00");
  return (
    <Modal
      title={edit ? "Editar franja" : "Agregar horas libres"}
      close={close}
    >
      <ActionForm
        path={edit ? `/availability/${edit.id}` : "/availability"}
        method={edit ? "PUT" : "POST"}
        payload={() => ({ day_of_week: day, start_time: start, end_time: end })}
        done={done}
        cancel={close}
        label="Guardar horario"
      >
        <Field label="Día">
          <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {days.map((d, i) => (
              <option value={i + 1} key={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <div className="two-cols">
          <Field label="Desde">
            <input
              type="time"
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="Hasta">
            <input
              type="time"
              required
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
        </div>
      </ActionForm>
    </Modal>
  );
}
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
export function SettingsPage() {
  const feedback = useFeedback();
  const { setUser } = useSession(),
    [current, setCurrent] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  return (
    <>
      <PageHeader
        title="Configuración de cuenta"
        description="Tu seguridad y tus datos, bajo tu control."
      />
      <div className="narrow stack">
        <section className="panel">
          <ActionForm
            title="Cambiar contraseña"
            path="/auth/password"
            method="PUT"
            payload={() => ({ current_password: current, password })}
            label="Actualizar contraseña"
            done={() => setUser(null)}
          >
            <Field label="Contraseña actual">
              <input
                type="password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </Field>
            <Field label="Nueva contraseña">
              <input
                type="password"
                minLength={10}
                maxLength={128}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </ActionForm>
        </section>
        <section className="panel danger-zone">
          <h3>Eliminar mi cuenta</h3>
          <p>
            Se desactivará tu acceso, se anonimizará tu perfil y se ocultarán
            tus publicaciones. Los mensajes y registros necesarios para la
            moderación se conservarán.
          </p>
          <Notice error>{error}</Notice>
          <button
            className="button danger-button"
            onClick={async () => {
              if (
                !(await feedback.confirm({
                  title: "¿Eliminar tu cuenta?",
                  description:
                    "Se cerrará tu sesión, se anonimizará tu perfil y se ocultarán tus publicaciones. Los mensajes y registros de moderación se conservarán. Esta acción no se puede deshacer.",
                  acceptLabel: "Eliminar mi cuenta",
                  cancelLabel: "Conservar mi cuenta",
                }))
              )
                return;
              try {
                await api.request("/auth/account", "DELETE");
                feedback.notify("Tu cuenta ha sido eliminada");
                setUser(null);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Eliminar cuenta
          </button>
        </section>
      </div>
    </>
  );
}
