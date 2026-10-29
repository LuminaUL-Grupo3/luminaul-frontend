import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "@/config/api";
import { useSession } from "@/features/auth/hooks/useSession";
import { useFeedback } from "@/hooks/useFeedback";
import { useResource } from "@/hooks/useResource";
import { PageHeader, Loading, Notice, Empty } from "@/components/ui";
import { useGroupStatuses } from "../hooks/useGroupStatuses";
import { Publication, Course } from "../types";
import {
  PostCard,
  PostFilters,
  JoinGroupModal,
  FeedWelcomeBanner,
  FeedAside,
} from "../components";

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
  const [query, setQuery] = useState(""),
    [type, setType] = useState(""),
    [course, setCourse] = useState(""),
    [cycle, setCycle] = useState(""),
    [page, setPage] = useState(0),
    [joining, setJoining] = useState<Publication | null>(null),
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

  const groupStatuses = useGroupStatuses(
    mine
      ? []
      : posts.data
          .map((p) => p.group_id)
          .filter((id): id is string => Boolean(id)),
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

      {!mine && !search && <FeedWelcomeBanner />}

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

          <PostFilters
            query={query}
            onQueryChange={setQuery}
            type={type}
            onTypeChange={setType}
            course={course}
            onCourseChange={setCourse}
            cycle={cycle}
            onCycleChange={setCycle}
            courses={courses.data}
          />

          <Notice error>{error || posts.error}</Notice>

          {posts.loading ? (
            <Loading />
          ) : posts.data.length ? (
            posts.data.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                currentUserId={user?.id}
                groupStatus={p.group_id ? groupStatuses.statuses[p.group_id] : undefined}
                onRemove={remove}
                onInterestClick={setJoining}
              />
            ))
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

        <FeedAside />
      </div>

      {joining && (
        <JoinGroupModal
          post={joining}
          onClose={() => setJoining(null)}
          onSuccess={() => {
            if (joining.group_id) groupStatuses.markPending(joining.group_id);
          }}
        />
      )}
    </>
  );
}
