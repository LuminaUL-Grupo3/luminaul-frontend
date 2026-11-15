import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useSession } from "@/features/auth";
import { useMyProfileQuery } from "@/features/profile/hooks";
import { Loading, Modal, Notice, PageHeader } from "@/components/ui";
import {
  useCoursesQuery,
  useCreatePostMutation,
  useMyGroupsSummaryQuery,
  usePostDetailQuery,
  useUpdatePostMutation,
} from "../hooks/usePostsQueries";
import {
  PostCourseAndDetailsSection,
  PostLivePreview,
  PostTypeAndGroupSection,
} from "../components";
import {
  Course,
  CreatePostPayload,
  PostType,
  UpdatePostPayload,
} from "../types";
import "../styles/posts.css";
import "./PostEditor.css";

interface PostFormState {
  courseId: string;
  type: PostType;
  groupId: string;
  description: string;
  color: string;
  benefits: string;
  requirements: string;
  maxCapacity: number;
}

export function PostEditor() {
  const formRef = useRef<HTMLFormElement>(null);
  const hydratedPostIdRef = useRef<string | undefined>(undefined);
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user, isAdmin } = useSession();

  const [leaving, setLeaving] = useState(false);
  const [groupMode, setGroupMode] = useState<"new" | "existing">("new");
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  const [loadedCourse, setLoadedCourse] = useState<Course | null>(null);
  const [postUserId, setPostUserId] = useState("");
  const [postAuthor, setPostAuthor] = useState<{
    name: string;
    profilePhotoUrl?: string | null;
  } | null>(null);
  const [form, setForm] = useState<PostFormState>({
    courseId: "",
    type: "study_group",
    groupId: "",
    description: "",
    color: "white",
    benefits: "",
    requirements: "",
    maxCapacity: 5,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [dirty, setDirty] = useState(false);

  const coursesQuery = useCoursesQuery();
  const myGroupsQuery = useMyGroupsSummaryQuery(!isAdmin);
  const myProfile = useMyProfileQuery(Boolean(user) && !isAdmin);
  const postDetailQuery = usePostDetailQuery(id);
  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation(id || "");

  const courses = coursesQuery.data ?? [];
  const myGroups = myGroupsQuery.data ?? [];

  useEffect(() => {
    if (!id) {
      hydratedPostIdRef.current = undefined;
      return;
    }
    const post = postDetailQuery.data;
    if (!post || hydratedPostIdRef.current === id) return;
    hydratedPostIdRef.current = id;

    const existingGroupId = post.groupId || "";
    setForm({
      courseId: post.courseId || post.course?.id || "",
      type: post.type,
      groupId: existingGroupId,
      description: post.description,
      color: post.color || "white",
      benefits: post.benefits || "",
      requirements: post.requirements || "",
      maxCapacity: Math.min(8, Math.max(2, post.maxCapacity ?? 5)),
    });
    if (existingGroupId) setGroupMode("existing");

    const authorUserId = post.userId || post.author?.id || "";
    if (authorUserId) setPostUserId(authorUserId);
    if (post.author) {
      setPostAuthor({
        name: post.author.name || "",
        profilePhotoUrl: post.author.profilePhotoUrl || null,
      });
    }
    if (post.course) {
      setLoadedCourse(post.course);
      if (typeof post.course.cycle === "number") {
        setSelectedCycle(post.course.cycle);
      }
    }
  }, [id, postDetailQuery.data]);

  useEffect(() => {
    if (!form.courseId || courses.length === 0 || selectedCycle !== null) return;
    const current = courses.find((c) => c.id === form.courseId);
    if (current && typeof current.cycle === "number") {
      setSelectedCycle(current.cycle);
    }
  }, [form.courseId, courses, selectedCycle]);

  const availableCycles = useMemo(() => {
    const set = new Set<number>();
    for (const c of courses) {
      if (typeof c.cycle === "number" && c.cycle > 0) set.add(c.cycle);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [courses]);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === form.courseId),
    [courses, form.courseId],
  );
  const selectedGroup = useMemo(
    () => (form.groupId ? myGroups.find((g) => g.id === form.groupId) || null : null),
    [myGroups, form.groupId],
  );
  const activeCourse = selectedCourse || loadedCourse;

  const currentUserId = user?.id || myProfile.data?.userId;
  const isOwner =
    !isEditing ||
    !postUserId ||
    !currentUserId ||
    postUserId === currentUserId ||
    isAdmin;

  const displayAuthorName =
    postAuthor?.name || myProfile.data?.name || "Alumno";
  const displayAuthorPhoto =
    postAuthor?.profilePhotoUrl || myProfile.data?.profilePhotoUrl || null;

  const authorInitials = useMemo(() => {
    const clean = displayAuthorName.trim();
    if (!clean) return "U";
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }, [displayAuthorName]);

  const busy = createPostMutation.isPending || updatePostMutation.isPending;

  function setField<K extends keyof PostFormState>(key: K, value: PostFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function handleCourseChange(courseId: string) {
    setField("courseId", courseId);
    const found = courses.find((c) => c.id === courseId);
    if (found && typeof found.cycle === "number") {
      setSelectedCycle(found.cycle);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!isOwner) {
      setSubmitError(
        "No tienes permiso para modificar esta publicación porque pertenece a otro usuario.",
      );
      return;
    }

    const errorsMap: Record<string, string> = {};
    if (!form.courseId) {
      errorsMap.courseId = "Selecciona una asignatura o curso de la lista.";
    }
    if (!form.description.trim()) {
      errorsMap.description =
        "La descripción no puede estar vacía. Describe qué van a estudiar o preparar.";
    }
    if (!form.benefits.trim()) {
      errorsMap.benefits =
        "Indica al menos un beneficio o meta que obtendrán al participar.";
    }
    if (!form.requirements.trim()) {
      errorsMap.requirements =
        "Especifica los requisitos o conocimientos previos necesarios.";
    }
    if (
      form.type === "study_group" &&
      groupMode === "existing" &&
      !form.groupId
    ) {
      errorsMap.groupId =
        "Selecciona un grupo de estudio existente de la lista para vincular.";
    }

    if (Object.keys(errorsMap).length > 0) {
      setFieldErrors(errorsMap);
      setSubmitError("");
      return;
    }

    setSubmitError("");
    setFieldErrors({});

    const normalizedCapacity = Math.min(8, Math.max(2, form.maxCapacity));
    const resolvedCapacity =
      form.type === "study_group" &&
      groupMode === "existing" &&
      form.groupId &&
      !isEditing
        ? (selectedGroup?.maxCapacity ?? normalizedCapacity)
        : normalizedCapacity;

    try {
      if (isEditing) {
        const updatePayload: UpdatePostPayload = {
          description: form.description,
          color: form.color,
          benefits: form.benefits,
          requirements: form.requirements,
          maxCapacity: resolvedCapacity,
          ...(form.type === "study_group" &&
          groupMode === "existing" &&
          form.groupId
            ? { groupId: form.groupId }
            : {}),
        };
        await updatePostMutation.mutateAsync(updatePayload);
      } else {
        const createPayload: CreatePostPayload = {
          courseId: form.courseId,
          type: form.type,
          description: form.description,
          color: form.color,
          benefits: form.benefits,
          requirements: form.requirements,
          maxCapacity: resolvedCapacity,
          ...(form.type === "study_group" &&
          groupMode === "existing" &&
          form.groupId
            ? { groupId: form.groupId }
            : {}),
        };
        await createPostMutation.mutateAsync(createPayload);
      }
      setDirty(false);
      navigate("/mis-publicaciones", {
        state: {
          message: isEditing
            ? "Post modificado con éxito"
            : "Publicación enviada con éxito",
        },
      });
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  }

  // SPEC-03: solo los alumnos pueden crear publicaciones; los admins pueden editar para moderar.
  if (!isEditing && isAdmin) {
    return (
      <>
        <PageHeader
          eyebrow="MODERACIÓN"
          title="Acceso solo para alumnos"
          description="Las cuentas de administración pueden moderar o editar publicaciones existentes, pero no crear publicaciones nuevas."
        />
        <Notice error>
          Tu rol de administración no permite crear nuevas publicaciones.
        </Notice>
        <Link className="button" to="/">
          Volver al inicio <ArrowUpRight size={18} />
        </Link>
      </>
    );
  }

  const error = submitError || postDetailQuery.error?.message || "";
  const isLoading = isEditing && postDetailQuery.isPending;

  return (
    <>
      <PageHeader
        eyebrow={
          isEditing
            ? `PUBLICACIÓN DE ${displayAuthorName.toUpperCase()}`
            : "COMPARTE TU CONOCIMIENTO"
        }
        title={isEditing ? "Editar publicación" : "Crear publicación"}
        description={
          isEditing
            ? `Editando la publicación de ${displayAuthorName}. Actualiza los objetivos, temas a repasar y detalles de la convocatoria.`
            : "Publica una iniciativa de estudio o asesoría para colaborar con alumnos de tu ciclo y carrera."
        }
      />
      {error && <Notice error>{error}</Notice>}
      {!isOwner && (
        <Notice error>
          Esta publicación pertenece a otro usuario ({displayAuthorName}). Solo
          el autor original puede guardar cambios.
        </Notice>
      )}
      {isLoading ? (
        <Loading />
      ) : (
        <div className="modern-editor-wrapper">
          <div className="modern-editor-grid">
            <form
              ref={formRef}
              className="panel form"
              onSubmit={submit}
              noValidate
            >
              <PostTypeAndGroupSection
                isEditing={isEditing}
                type={form.type}
                groupMode={groupMode}
                groupId={form.groupId}
                maxCapacity={form.maxCapacity}
                myGroups={myGroups}
                selectedGroup={selectedGroup}
                groupError={fieldErrors.groupId}
                onChangeField={(key, value) => {
                  if (key === "type") setField("type", value as PostType);
                  else if (key === "groupId") setField("groupId", String(value));
                  else setField("maxCapacity", Number(value));
                }}
                onChangeGroupMode={setGroupMode}
              />

              <PostCourseAndDetailsSection
                isEditing={isEditing}
                courseId={form.courseId}
                color={form.color}
                description={form.description}
                benefits={form.benefits}
                requirements={form.requirements}
                courses={courses}
                availableCycles={availableCycles}
                selectedCourse={selectedCourse}
                fieldErrors={fieldErrors}
                onCourseChange={handleCourseChange}
                onChangeField={(key, value) => setField(key, value)}
              />

              <div className="button-row" style={{ marginTop: 20 }}>
                <button className="button" disabled={busy || !isOwner}>
                  {busy
                    ? "Guardando…"
                    : isEditing
                      ? "Guardar cambios"
                      : "Publicar ahora"}
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

            <PostLivePreview
              color={form.color}
              type={form.type}
              groupMode={groupMode}
              selectedGroup={selectedGroup}
              activeCourse={activeCourse}
              description={form.description}
              benefits={form.benefits}
              requirements={form.requirements}
              maxCapacity={form.maxCapacity}
              displayAuthorName={displayAuthorName}
              displayAuthorPhoto={displayAuthorPhoto}
              authorInitials={authorInitials}
              isEditing={isEditing}
            />
          </div>
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
