import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useSession } from "@/features/auth";
import { useFeedback } from "@/hooks/useFeedback";
import { PageHeader, Loading, Notice, Empty } from "@/components/ui";
import {
  useCoursesQuery,
  useDeletePostMutation,
  useMyTutoringRequestsQuery,
  usePostsFeedQuery,
} from "../hooks/usePostsQueries";
import { useGroupStatuses } from "../hooks/useGroupStatuses";
import { PostFilterQuery, PostType, Publication } from "../types";
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
  const { user, isAdmin } = useSession();
  const feedbackUi = useFeedback();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(""),
    [type, setType] = useState(""),
    [course, setCourse] = useState(""),
    [cycle, setCycle] = useState(""),
    [page, setPage] = useState(0),
    [joining, setJoining] = useState<Publication | null>(null),
    [error, setError] = useState("");

  // Consume una sola vez el resultado del editor; filtrar no vuelve a mostrarlo.
  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (!state?.message) return;
    feedbackUi.notify(state.message);
    navigate(location.pathname + location.search, {
      replace: true,
      state: null,
    });
  }, [location.key, feedbackUi.notify, navigate]);

  const coursesQuery = useCoursesQuery();
  const filterQuery = useMemo<PostFilterQuery>(
    () => ({
      limit: 12,
      offset: page * 12,
      ...(query ? { search: query } : {}),
      ...(type ? { type: type as PostType } : {}),
      ...(course ? { courseId: course } : {}),
      ...(cycle ? { cycle: Number(cycle) } : {}),
    }),
    [page, query, type, course, cycle],
  );

  const postsQuery = usePostsFeedQuery(filterQuery, { mine });
  const myTutoringRequestsQuery = useMyTutoringRequestsQuery(
    Boolean(user) && !mine && !isAdmin,
  );
  const deletePostMutation = useDeletePostMutation();
  const postItems = postsQuery.data ?? [];
  const courseItems = coursesQuery.data ?? [];

  const tutoringByPostId = useMemo(
    () =>
      new Map(
        (myTutoringRequestsQuery.data ?? []).map((item) => [
          item.publicationId,
          item,
        ]),
      ),
    [myTutoringRequestsQuery.data],
  );

  const groupIds = useMemo(
    () =>
      mine || isAdmin
        ? []
        : postItems
            .map((p) => p.groupId)
            .filter((id): id is string => Boolean(id)),
    [mine, isAdmin, postItems],
  );

  const groupStatuses = useGroupStatuses(groupIds);

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
      return;
    }
    try {
      setError("");
      await deletePostMutation.mutateAsync(id);
      feedbackUi.notify("Post eliminado con éxito");
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
          !isAdmin ? (
            <Link className="button" to="/publicar">
              <Plus size={18} />
              Crear publicación
            </Link>
          ) : undefined
        }
      />

      {!mine && !search && <FeedWelcomeBanner />}

      <div className="feed-layout">
        <section>
          <div className="feed-toolbar">
            <h2>
              {mine ? "Tu historial" : "En la comunidad"}{" "}
              <span className="count">{postItems.length}</span>
            </h2>
            <span className="muted small-label">Más recientes primero</span>
          </div>

          <PostFilters
            query={query}
            onQueryChange={setQuery}
            type={type}
            onTypeChange={setType}
            course={course}
            onCourseChange={(value) => {
              setCourse(value);
              if (value) setCycle("");
            }}
            cycle={cycle}
            onCycleChange={(value) => {
              setCycle(value);
              if (value) setCourse("");
            }}
            courses={courseItems}
          />

          <Notice error>{error || postsQuery.error?.message}</Notice>

          {postsQuery.isPending ? (
            <Loading />
          ) : postItems.length ? (
            postItems.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                groupStatus={
                  p.groupId ? groupStatuses.statuses[p.groupId] : undefined
                }
                tutoringStatus={tutoringByPostId.get(p.id)?.status}
                tutoringGroupId={tutoringByPostId.get(p.id)?.groupId}
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
              disabled={postItems.length < 12}
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
            if (joining.groupId) groupStatuses.markPending(joining.groupId);
          }}
        />
      )}
    </>
  );
}
