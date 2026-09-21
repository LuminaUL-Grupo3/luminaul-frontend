import { useEffect, useState, useRef, FormEvent } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Plus,
  Search,
  Users,
  BookOpen,
  Trash2,
  Pencil,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { api, Publication, Course, date } from "./api";
import { useSession } from "./session";
import { useFeedback } from "./feedback";
import {
  useResource,
  PageHeader,
  Loading,
  Notice,
  Empty,
  Avatar,
  Modal,
  Field,
  ActionForm,
  ReportButton,
} from "./ui";
export function FeedPage({
  mine = false,
  search = false,
}: {
  mine?: boolean;
  search?: boolean;
}) {
  const { user } = useSession();
  const feedbackUi = useFeedback();
  const location = useLocation();
  const memberships = useResource<{ id: string }[]>("/groups", []);
  const [query, setQuery] = useState(""),
    [type, setType] = useState(""),
    [course, setCourse] = useState(""),
    [cycle, setCycle] = useState(""),
    [page, setPage] = useState(0),
    [joining, setJoining] = useState<Publication | null>(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [feedback, setFeedback] = useState("");
  const courses = useResource<Course[]>("/courses", []);
  const params = new URLSearchParams({
    limit: "12",
    offset: String(page * 12),
    ...(query ? { search: query } : {}),
    ...(type ? { type } : {}),
    ...(course ? { course_id: course } : {}),
    ...(cycle ? { cycle } : {}),
  });
  const posts = useResource<Publication[]>(
    `${mine ? "/posts/me" : "/posts"}?${params}`,
    [],
  );
  useEffect(() => setPage(0), [query, type, course, cycle]);
  async function remove(id: string) {
    if (
      !(await feedbackUi.confirm({
        title: "¿Seguro que desea borrar el post?",
        description:
          "El post dejará de mostrarse en el inicio y las búsquedas. El grupo y sus conversaciones se conservarán.",
        acceptLabel: "Aceptar",
        cancelLabel: "Regresar",
      }))
    ) {
      setFeedback("No se eliminó el post");
      return;
    }
    try {
      setError("");
      await api.request(`/posts/${id}`, "DELETE");
      setFeedback("Post eliminado con éxito");
      posts.reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow={mine ? "TU ACTIVIDAD" : "APRENDEMOS MEJOR JUNTOS"}
        title={
          mine
            ? "Mis publicaciones"
            : search
              ? "Encuentra tu grupo."
              : `Hola, ${user?.name.split(" ")[0]}.`
        }
        description={
          mine
            ? "Gestiona lo que compartes con la comunidad."
            : search
              ? "Un curso, una duda, una nueva conexión."
              : "Siempre hay algo que puedes aprender. Y algo que puedes compartir."
        }
        action={
          <Link className="button" to="/publicar">
            <Plus size={18} />
            Crear publicación
          </Link>
        }
      />
      {!mine && !search && (
        <section className="welcome-banner">
          <div>
            <span className="eyebrow">EL CONOCIMIENTO SE COMPARTE</span>
            <h2>
              Tu siguiente idea
              <br />
              puede empezar aquí.
            </h2>
            <p>
              Conecta con estudiantes que están aprendiendo lo mismo que tú.
            </p>
            <Link to="/grupos">
              Explorar mis grupos <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="banner-art" aria-hidden="true">
            <div className="art-book">
              <BookOpen size={54} />
            </div>
            <div className="art-users">
              <Users size={34} />
            </div>
            <span className="art-star">✳</span>
          </div>
        </section>
      )}
      <div className="feed-layout">
        <section>
          <Notice>
            {feedback ||
              (location.state as { message?: string } | null)?.message}
          </Notice>
          <div className="feed-toolbar">
            <h2>
              {mine ? "Tu historial" : "En la comunidad"}{" "}
              <span className="count">{posts.data.length}</span>
            </h2>
            <span className="muted small-label">Más recientes primero</span>
          </div>
          <div className="filters">
            <label className="search-input">
              <Search size={18} />
              <input
                aria-label="Buscar publicaciones"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar un curso o una publicación…"
              />
            </label>
            <div className="filter-row">
              <div
                className="type-filters"
                role="group"
                aria-label="Tipo de publicación"
              >
                {[
                  ["study_group", "Grupo de Estudio"],
                  ["tutoring", "Asesoría"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`button small ${type === value ? "" : "secondary"}`}
                    aria-pressed={type === value}
                    onClick={() => setType(type === value ? "" : value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <select
                aria-label="Curso"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="">Todos los cursos</option>
                {courses.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Ciclo"
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
              >
                <option value="">Todos los ciclos</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={i + 1}>
                    Ciclo {i + 1}
                  </option>
                ))}
              </select>
              <SlidersHorizontal size={17} />
            </div>
          </div>
          <Notice error>{error || posts.error}</Notice>
          {posts.loading ? (
            <Loading />
          ) : posts.data.length ? (
            posts.data.map((p) => {
              const authorName = p.author?.name || p.author_name || "Estudiante";
              const authorPhoto = p.author?.profile_photo_url || p.photo_url;
              const authorId = p.author?.user_id || p.user_id || "";
              const courseName = p.course?.name || p.course_name || "Curso";
              const cycleNum = p.course?.cycle ?? p.cycle ?? 1;
              const isMine =
                (Boolean(p.user_id) && p.user_id === user?.id) ||
                (Boolean(p.author?.user_id) && p.author?.user_id === user?.id);
              return (
                <article className="post-card" key={p.id}>
                  <div className="post-top">
                    <Link className="person" to={authorId ? `/perfil/${authorId}` : "#"}>
                      <Avatar name={authorName} src={authorPhoto} />
                      <div>
                        <strong>{authorName}</strong>
                        <span>{date(p.created_at)}</span>
                      </div>
                    </Link>
                    <ReportButton kind="publication" id={p.id} />
                  </div>
                  <div className="tags">
                    <span
                      className={`tag ${p.type === "tutoring" ? "purple" : ""}`}
                    >
                      {p.type === "tutoring" ? "Asesoría" : "Grupo de Estudio"}
                    </span>
                    <span className="course-tag">{courseName}</span>
                    {p.status !== "published" && (
                      <span className="tag warning">
                        {p.status === "hidden" ? "Oculta" : "En revisión"}
                      </span>
                    )}
                  </div>
                  <p className="post-description">{p.description}</p>
                  <div className="post-details">
                    <span>
                      <BookOpen size={15} />
                      Ciclo {cycleNum}
                    </span>
                    {p.max_capacity ? (
                      <span>
                        <Users size={15} />
                        Hasta {p.max_capacity} integrantes
                      </span>
                    ) : null}
                  </div>
                  {(p.benefits || p.requirements) && (
                    <details className="post-more">
                      <summary>Beneficios y requisitos</summary>
                      {p.benefits && (
                        <p>
                          <strong>Beneficios:</strong> {p.benefits}
                        </p>
                      )}
                      {p.requirements && (
                        <p>
                          <strong>Requisitos:</strong> {p.requirements}
                        </p>
                      )}
                    </details>
                  )}
                  <footer className="post-actions">
                    {isMine ? (
                      <>
                        <Link className="text-button" to={`/publicar/${p.id}`}>
                          <Pencil size={16} />
                          Editar publicación
                        </Link>
                        <button
                          className="text-button danger"
                          onClick={() => remove(p.id)}
                        >
                          <Trash2 size={16} />
                          Borrar publicación
                        </button>
                      </>
                    ) : p.group_id &&
                      !memberships.data.some((g) => g.id === p.group_id) &&
                      !memberships.loading ? (
                      <button
                        className="text-button"
                        onClick={() => {
                          setJoining(p);
                          setMessage("");
                        }}
                      >
                        Me interesa <ArrowRight size={16} />
                      </button>
                    ) : null}
                    {memberships.data.some((g) => g.id === p.group_id) && (
                      <Link
                        className="text-button muted"
                        to={`/grupos/${p.group_id}`}
                      >
                        Ver grupo <ArrowUpRight size={15} />
                      </Link>
                    )}
                  </footer>
                </article>
              );
            })
          ) : (
            <Empty
              title={
                mine
                  ? "No tienes publicaciones aún"
                  : search || query || type || course || cycle
                    ? "No se encontraron resultados para tu búsqueda"
                    : "No hay publicaciones aún"
              }
            >
              Cambia los filtros o comparte la primera publicación.
            </Empty>
          )}
          <div className="pagination">
            <button
              className="button secondary small"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </button>
            <span>Página {page + 1}</span>
            <button
              className="button secondary small"
              disabled={posts.data.length < 12}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </button>
          </div>
        </section>
        <aside className="feed-aside">
          <div className="info-card">
            <span className="icon-tile">
              <Users size={24} />
            </span>
            <h3>
              Un buen equipo
              <br />
              hace la diferencia.
            </h3>
            <p>
              En tus grupos puedes coordinar horarios y conversar en tiempo
              real.
            </p>
            <Link to="/grupos" className="text-button">
              Ir a mis grupos <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="community-note">
            <h4>Hagamos espacio para todos.</h4>
            <p>
              Comparte con respeto, explica tus ideas y reconoce el trabajo de
              los demás.
            </p>
            <span>LuminaUL · Comunidad universitaria</span>
          </div>
        </aside>
      </div>
      {joining && (
        <Modal
          title={`Unirme a ${joining.group_name || "grupo"}`}
          close={() => setJoining(null)}
        >
          <ActionForm
            path={`/groups/${joining.group_id}/requests`}
            payload={() => ({ message })}
            label="Enviar solicitud"
          >
            <Field label="Preséntate al grupo">
              <textarea
                required
                minLength={1}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntales qué te gustaría aprender…"
              />
            </Field>
          </ActionForm>
        </Modal>
      )}
    </>
  );
}
export function PostEditor() {
  const formRef = useRef<HTMLFormElement>(null);
  const [leaving, setLeaving] = useState(false);
  const { id } = useParams(),
    navigate = useNavigate();
  const courses = useResource<Course[]>("/courses", []);
  const [form, setForm] = useState({
      course_id: "",
      type: "study_group",
      description: "",
      benefits: "",
      requirements: "",
      max_capacity: 10,
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(!id),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!id) return;
    let active = true;
    api
      .request<Publication>(`/posts/${id}`)
      .then((p) => {
        if (active) {
          setForm({
            course_id: p.course?.id || p.course_id || "",
            type: p.type,
            description: p.description,
            benefits: p.benefits || "",
            requirements: p.requirements || "",
            max_capacity: p.max_capacity ?? 10,
          });
          setLoaded(true);
        }
      })
      .catch((e) => setError(e.message));
    return () => {
      active = false;
    };
  }, [id]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    const missing: string[] = [];
    if (!form.course_id) missing.push("Curso");
    if (!form.description.trim()) missing.push("Descripción");
    if (!form.benefits.trim()) missing.push("Beneficios");
    if (!form.requirements.trim()) missing.push("Requisitos");

    if (missing.length > 0) {
      setError(
        `Dicho(s) campo(s) en blanco debe completarse: ${missing.join(", ")}.`
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.request(
        id ? `/posts/${id}` : "/posts",
        id ? "PUT" : "POST",
        form,
      );
      setDirty(false);
      navigate("/mis-publicaciones", {
        state: {
          message: id
            ? "Post modificado con éxito"
            : "Publicación enviada con éxito",
        },
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const set = (key: string, value: string | number) => {
    setForm({ ...form, [key]: value });
    setDirty(true);
  };
  return (
    <>
      <PageHeader
        eyebrow="COMPARTE TU CONOCIMIENTO"
        title={id ? "Editar publicación" : "Crear publicación"}
        description="Cuenta qué quieres aprender o compartir. Las publicaciones son de texto."
      />
      <Notice error>{error}</Notice>
      {!loaded ? (
        <Loading />
      ) : (
        <div className="editor-layout">
          <form ref={formRef} className="panel form" onSubmit={submit} noValidate>
            <div className="two-cols">
              <Field label="Tipo de publicación">
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  <option value="study_group">Grupo de Estudio</option>
                  <option value="tutoring">Asesoría</option>
                </select>
              </Field>
              <Field label="Curso">
                <select
                  required
                  value={form.course_id}
                  onChange={(e) => set("course_id", e.target.value)}
                >
                  <option value="">Selecciona un curso</option>
                  {courses.data.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field
              label="Descripción"
              hint={`${form.description.length}/3000 caracteres`}
            >
              <textarea
                required
                maxLength={3000}
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="¿Qué van a estudiar? ¿Cómo te gustaría organizarlo?"
              />
            </Field>
            <Field label="Beneficios">
              <textarea
                required
                maxLength={1000}
                value={form.benefits}
                onChange={(e) => set("benefits", e.target.value)}
                placeholder="Qué podrán aprender o resolver"
              />
            </Field>
            <Field label="Requisitos">
              <textarea
                required
                maxLength={1000}
                value={form.requirements}
                onChange={(e) => set("requirements", e.target.value)}
                placeholder="Conocimientos o materiales necesarios"
              />
            </Field>
            <Field label="Capacidad del grupo" hint="Incluye al administrador.">
              <input
                type="number"
                required
                min={2}
                max={100}
                value={form.max_capacity}
                onChange={(e) => set("max_capacity", Number(e.target.value))}
              />
            </Field>
            <div className="button-row">
              <button className="button" disabled={busy}>
                {busy ? "Guardando…" : id ? "Guardar cambios" : "Publicar"}
                <ArrowUpRight size={18} />
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  if (dirty) setLeaving(true);
                  else navigate("/mis-publicaciones");
                }}
              >
                Regresar
              </button>
            </div>
          </form>
          <aside className="info-card">
            <BookOpen size={28} />
            <h3>
              Una invitación clara
              <br />
              llega más lejos.
            </h3>
            <p>
              Incluye el tema, lo que esperas lograr y lo que necesita traer
              cada persona.
            </p>
            <p>
              Al publicar se crea un grupo y quedas registrado como su
              administrador.
            </p>
          </aside>
        </div>
      )}
      {leaving && (
        <Modal
          title="¿Desea guardar los cambios?"
          close={() => setLeaving(false)}
        >
          <p className="confirmation-copy">
            Puedes guardar tu publicación antes de regresar, continuar editando
            o salir sin guardar los cambios.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setLeaving(false)}
            >
              Seguir editando
            </button>
            <button
              className="button secondary"
              onClick={() => navigate("/mis-publicaciones")}
            >
              Salir sin guardar
            </button>
            <button
              className="button"
              onClick={() => {
                setLeaving(false);
                formRef.current?.requestSubmit();
              }}
            >
              Guardar cambios
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
