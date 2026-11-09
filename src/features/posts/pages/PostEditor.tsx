import { useEffect, useState, useRef, useMemo, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Link2,
} from "lucide-react";
import { api } from "@/config/api";
import { useResource } from "@/hooks/useResource";
import { PageHeader, Loading, Notice, Modal, Field } from "@/components/ui";

import { Course, Publication } from "../types";
import "./PostEditor.css";

export interface MyGroupSummary {
  id: string;
  name: string;
  description?: string | null;
  courseCode?: string;
  myRole?: string | null;
  maxCapacity?: number;
  currentMembers?: number;
}

// Formatea de manera uniforme los nombres de cursos a Title Case profesional
export function formatCourseName(rawName: string): string {
  if (!rawName) return "";
  if (rawName.includes("/")) {
    return rawName
      .split("/")
      .map((part) => formatCourseName(part.trim()))
      .join(" / ");
  }
  const romanNumerals = new Set([
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
  ]);
  const lowercaseWords = new Set([
    "de",
    "del",
    "la",
    "las",
    "el",
    "los",
    "y",
    "e",
    "en",
    "para",
    "a",
    "por",
  ]);

  return rawName
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const cleanUpper = word
        .toUpperCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      if (romanNumerals.has(cleanUpper)) return word.toUpperCase();
      const lower = word.toLowerCase();
      if (index > 0 && lowercaseWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function PostEditor() {
  const formRef = useRef<HTMLFormElement>(null);
  const [leaving, setLeaving] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const courses = useResource<Course[]>("/courses", []);
  const myGroups = useResource<MyGroupSummary[]>("/groups/me", []);
  const myProfile = useResource<{
    userId?: string;
    user_id?: string;
    name?: string;
    profilePhotoUrl?: string | null;
    profile_photo_url?: string | null;
  }>("/profiles/me", { name: "" });

  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  const [groupMode, setGroupMode] = useState<"new" | "existing">("new");

  const [postAuthor, setPostAuthor] = useState<{
    name: string;
    profilePhotoUrl?: string | null;
  } | null>(null);
  const [postUserId, setPostUserId] = useState<string>("");
  const [loadedCourse, setLoadedCourse] = useState<Course | null>(null);
  const [loadedGroupName, setLoadedGroupName] = useState<string>("");

  const [form, setForm] = useState({
    course_id: "",
    type: "study_group",
    group_id: "",
    description: "",
    benefits: "",
    requirements: "",
    max_capacity: 5, // Máximo 8 integrantes según requerimiento
  });

  // Errores dinámicos en línea por campo
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(!id);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    api
      .request<Publication>(`/posts/${id}`)
      .then((p) => {
        if (!active) return;
        const courseId = p.courseId || p.course?.id || p.course_id || "";
        const existingGroupId = p.groupId || p.group_id || "";
        setForm({
          course_id: courseId,
          type: p.type,
          group_id: existingGroupId,
          description: p.description,
          benefits: p.benefits || "",
          requirements: p.requirements || "",
          max_capacity: Math.min(8, Math.max(2, p.maxCapacity ?? p.max_capacity ?? 5)),
        });

        if (existingGroupId) {
          setGroupMode("existing");
        }

        const authorUserId = p.userId || p.user_id || p.author?.id || p.author?.user_id || "";
        if (authorUserId) {
          setPostUserId(authorUserId);
        }

        if (p.author) {
          setPostAuthor({
            name: p.author.name || p.author_name || "",
            profilePhotoUrl:
              p.author.profilePhotoUrl ||
              p.author.profile_photo_url ||
              p.photo_url ||
              null,
          });
        } else if (p.author_name) {
          setPostAuthor({
            name: p.author_name,
            profilePhotoUrl: p.photo_url || null,
          });
        }

        if (p.course) {
          setLoadedCourse(p.course);
          if (typeof p.course.cycle === "number") {
            setSelectedCycle(p.course.cycle);
          }
        }

        if (p.group_name) {
          setLoadedGroupName(p.group_name);
        }
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const selectedGroup = useMemo(() => {
    if (!form.group_id) return null;
    const found = myGroups.data.find((g) => g.id === form.group_id);
    if (found) return found;
    if (loadedGroupName) {
      return {
        id: form.group_id,
        name: loadedGroupName,
        maxCapacity: form.max_capacity,
      };
    }
    return null;
  }, [myGroups.data, form.group_id, loadedGroupName, form.max_capacity]);

  // Sincronizar ciclo seleccionado si el curso ya está fijado
  useEffect(() => {
    if (form.course_id && courses.data.length > 0) {
      const current = courses.data.find((c) => c.id === form.course_id);
      if (current && typeof current.cycle === "number" && selectedCycle === null) {
        setSelectedCycle(current.cycle);
      }
    }
  }, [form.course_id, courses.data]);

  // Lista única de ciclos ordenados de menor a mayor
  const availableCycles = useMemo(() => {
    const set = new Set<number>();
    for (const c of courses.data) {
      if (typeof c.cycle === "number" && c.cycle > 0) {
        set.add(c.cycle);
      }
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [courses.data]);

  const selectedCourse = useMemo(() => {
    return courses.data.find((c) => c.id === form.course_id);
  }, [courses.data, form.course_id]);

  const activeCourse = selectedCourse || loadedCourse;

  const currentUserId = myProfile.data?.userId || myProfile.data?.user_id;
  const isOwner = !id || !postUserId || !currentUserId || postUserId === currentUserId;

  const displayAuthorName =
    postAuthor?.name ||
    myProfile.data?.name ||
    "Estudiante";

  const displayAuthorPhoto =
    postAuthor?.profilePhotoUrl ||
    myProfile.data?.profilePhotoUrl ||
    null;

  const authorInitials = useMemo(() => {
    if (!displayAuthorName) return "U";
    const parts = displayAuthorName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }, [displayAuthorName]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!isOwner) {
      setError("No tienes permiso para modificar esta publicación porque pertenece a otro usuario.");
      return;
    }
    const errorsMap: Record<string, string> = {};

    if (!form.course_id) {
      errorsMap.course_id = "Selecciona una asignatura o curso de la lista.";
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
    if (form.type === "study_group" && groupMode === "existing" && !form.group_id) {
      errorsMap.group_id =
        "Selecciona un grupo de estudio existente de la lista para vincular.";
    }

    if (Object.keys(errorsMap).length > 0) {
      setFieldErrors(errorsMap);
      setError("");
      return;
    }

    setBusy(true);
    setError("");
    setFieldErrors({});

    try {
      const payload: Record<string, unknown> = {
        courseId: form.course_id,
        type: form.type,
        description: form.description,
        benefits: form.benefits,
        requirements: form.requirements,
      };

      if (form.type === "study_group") {
        if (groupMode === "new") {
          payload.maxCapacity = Math.min(8, Math.max(2, form.max_capacity));
        } else if (groupMode === "existing" && form.group_id) {
          payload.groupId = form.group_id;
          if (selectedGroup?.maxCapacity) {
            payload.maxCapacity = selectedGroup.maxCapacity;
          }
        }
      } else {
        payload.maxCapacity = Math.min(8, Math.max(2, form.max_capacity));
      }

      await api.request(
        id ? `/posts/${id}` : "/posts",
        id ? "PUT" : "POST",
        payload,
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
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);

    // Limpieza reactiva inmediata del error del campo modificado
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={id ? `PUBLICACIÓN DE ${displayAuthorName.toUpperCase()}` : "COMPARTE TU CONOCIMIENTO"}
        title={id ? "Editar publicación" : "Crear publicación"}
        description={
          id
            ? `Editando la publicación de ${displayAuthorName}. Actualiza los objetivos, temas a repasar y detalles de la convocatoria.`
            : "Publica una iniciativa de estudio o asesoría para colaborar con estudiantes de tu ciclo y carrera."
        }
      />
      {error && <Notice error>{error}</Notice>}
      {!isOwner && (
        <Notice error>
          Esta publicación pertenece a otro usuario ({displayAuthorName}). Solo el autor original puede guardar cambios.
        </Notice>
      )}
      {!loaded ? (
        <Loading />
      ) : (
        <div className="modern-editor-wrapper">
          <div className="modern-editor-grid">
            {/* Formulario Principal */}
            <form ref={formRef} className="panel form" onSubmit={submit} noValidate>
              {/* 1. Selector Visual de Tipo de Publicación */}
              <Field
                label="1. Tipo de Publicación"
                hint="Selecciona cómo deseas colaborar con otros estudiantes."
              >
                {/* Select accesible para fallback y compatibilidad */}
                <select
                  aria-label="Tipo de publicación"
                  className="sr-only"
                  style={{
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    opacity: 0,
                  }}
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  <option value="study_group">Grupo de Estudio</option>
                  <option value="tutoring">Asesoría</option>
                </select>

                <div
                  className="type-card-grid"
                  role="radiogroup"
                  aria-label="Tipo de publicación"
                >
                  <div
                    role="radio"
                    aria-checked={form.type === "study_group"}
                    tabIndex={0}
                    className={`type-card-option ${
                      form.type === "study_group" ? "selected" : ""
                    }`}
                    onClick={() => set("type", "study_group")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        set("type", "study_group");
                      }
                    }}
                  >
                    <div className="type-card-header">
                      <div className="type-card-icon">
                        <Users size={22} />
                      </div>
                      <span className="type-card-badge">Grupo colaborativo</span>
                    </div>
                    <h3 className="type-card-title">Grupo de Estudio</h3>
                    <p className="type-card-desc">
                      Crea un espacio de estudio compartido para preparar exámenes,
                      repasar guías y trabajar en equipo.
                    </p>
                  </div>

                  <div
                    role="radio"
                    aria-checked={form.type === "tutoring"}
                    tabIndex={0}
                    className={`type-card-option ${
                      form.type === "tutoring" ? "selected" : ""
                    }`}
                    onClick={() => set("type", "tutoring")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        set("type", "tutoring");
                      }
                    }}
                  >
                    <div className="type-card-header">
                      <div className="type-card-icon">
                        <GraduationCap size={22} />
                      </div>
                      <span className="type-card-badge">Acompañamiento</span>
                    </div>
                    <h3 className="type-card-title">Asesoría Académica</h3>
                    <p className="type-card-desc">
                      Brinda u ofrece soporte temático y mentoría personalizada en
                      materias específicas de la malla.
                    </p>
                  </div>
                </div>
              </Field>

              {/* Modalidad de Grupo de Estudio (Crear nuevo vs Vincular existente) */}
              {form.type === "study_group" && (
                <Field
                  label="Modalidad del Grupo de Estudio"
                  hint="Elige si deseas auto-crear una sala nueva o adjuntar un grupo que ya lideras."
                >
                  <div
                    className="group-mode-toggle"
                    role="radiogroup"
                    aria-label="Modalidad del grupo de estudio"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={groupMode === "new"}
                      className={`group-mode-btn ${
                        groupMode === "new" ? "active" : ""
                      }`}
                      onClick={() => {
                        setGroupMode("new");
                        set("group_id", "");
                      }}
                    >
                      <Sparkles size={18} />
                      <div>
                        <strong style={{ display: "block" }}>
                          Crear nuevo grupo
                        </strong>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          Auto-generado para el curso seleccionado
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={groupMode === "existing"}
                      className={`group-mode-btn ${
                        groupMode === "existing" ? "active" : ""
                      }`}
                      onClick={() => setGroupMode("existing")}
                    >
                      <Link2 size={18} />
                      <div>
                        <strong style={{ display: "block" }}>
                          Vincular grupo existente
                        </strong>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          Usa un grupo que ya tienes activo
                        </span>
                      </div>
                    </button>
                  </div>

                  {groupMode === "new" && (
                    <div className="group-capacity-inline" style={{ marginTop: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#334155",
                          }}
                        >
                          Capacidad Máxima del Grupo
                        </label>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          Mín. 2 y máx. 8 integrantes
                        </span>
                      </div>
                      <div className="capacity-control-box">
                        <div className="capacity-slider-wrap">
                          <input
                            type="range"
                            min={2}
                            max={8}
                            step={1}
                            value={form.max_capacity}
                            onChange={(e) => {
                              const val = Math.min(8, Math.max(2, Number(e.target.value)));
                              set("max_capacity", val);
                            }}
                            aria-label="Capacidad del grupo"
                          />
                          <input
                            type="number"
                            min={2}
                            max={8}
                            value={form.max_capacity}
                            onChange={(e) => {
                              const val = Math.min(8, Math.max(2, Number(e.target.value)));
                              set("max_capacity", val);
                            }}
                            style={{ width: 80, textAlign: "center" }}
                            aria-label="Número de integrantes"
                          />
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          marginTop: 6,
                          display: "block",
                        }}
                      >
                        Mínimo 2 y máximo 8 integrantes (incluye al líder/creador).
                      </span>
                    </div>
                  )}

                  {groupMode === "existing" && (
                    <div className="group-select-container">
                      {myGroups.data.length === 0 ? (
                        <div className="empty-groups-notice">
                          <AlertCircle size={16} />
                          <span>
                            Aún no perteneces a ningún grupo de estudio. Elige
                            "Crear nuevo grupo" para generarlo automáticamente.
                          </span>
                        </div>
                      ) : (
                        <>
                          <select
                            aria-label="Seleccionar grupo existente"
                            className={`existing-group-select ${
                              fieldErrors.group_id ? "input-error" : ""
                            }`}
                            value={form.group_id}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              set("group_id", selectedId);
                              const grp = myGroups.data.find(
                                (g) => g.id === selectedId,
                              );
                              if (grp && typeof grp.maxCapacity === "number") {
                                set(
                                  "max_capacity",
                                  Math.min(8, Math.max(2, grp.maxCapacity)),
                                );
                              }
                            }}
                          >
                            <option value="">
                              -- Selecciona un grupo existente --
                            </option>
                            {myGroups.data.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}{" "}
                                {g.myRole === "leader" ? "(Líder)" : "(Miembro)"}{" "}
                                • {g.currentMembers ?? 1} miembros
                              </option>
                            ))}
                          </select>
                          {fieldErrors.group_id && (
                            <div className="field-error-message">
                              <AlertCircle size={15} />
                              <span>{fieldErrors.group_id}</span>
                            </div>
                          )}
                          {selectedGroup && (
                            <div className="selected-group-card">
                              <Users size={16} />
                              <span>
                                Vinculado a: <strong>{selectedGroup.name}</strong>{" "}
                                • Capacidad: {selectedGroup.maxCapacity ?? 6} integrantes
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </Field>
              )}

              {/* 2. Asignatura o Curso */}
              <Field
                label="2. Asignatura o Curso"
                hint="Selecciona la materia correspondiente a la publicación."
              >
                <div
                  className={`courses-category-box ${
                    fieldErrors.course_id ? "has-error" : ""
                  }`}
                >
                  {/* Selector Estructurado nativo con Optgroups */}
                  <select
                    required
                    aria-label="Curso"
                    className={fieldErrors.course_id ? "input-error" : ""}
                    value={form.course_id}
                    onChange={(e) => {
                      const cid = e.target.value;
                      set("course_id", cid);
                      const found = courses.data.find((c) => c.id === cid);
                      if (found && typeof found.cycle === "number") {
                        setSelectedCycle(found.cycle);
                      }
                    }}
                  >
                    <option value="">Selecciona un curso</option>
                    {availableCycles.map((cycleNum) => {
                      const groupCourses = courses.data.filter(
                        (c) => c.cycle === cycleNum,
                      );
                      if (groupCourses.length === 0) return null;
                      return (
                        <optgroup
                          key={cycleNum}
                          label={
                            cycleNum === 11
                              ? `Cursos Electivos (${groupCourses.length} cursos)`
                              : `Ciclo ${cycleNum} (${groupCourses.length} cursos)`
                          }
                        >
                          {groupCourses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {formatCourseName(c.name)}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>

                  {/* Banner de Confirmación del Curso Seleccionado */}
                  {selectedCourse && (
                    <div className="selected-course-banner">
                      <div className="selected-course-info">
                        <CheckCircle2 size={20} />
                        <div>
                          <strong>{formatCourseName(selectedCourse.name)}</strong>
                          {selectedCourse.cycle && (
                            <span
                              className="selected-course-tag"
                              style={{ marginLeft: 8 }}
                            >
                              {selectedCourse.cycle === 11
                                ? "Curso Electivo"
                                : `Ciclo ${selectedCourse.cycle}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="button small secondary"
                        onClick={() => set("course_id", "")}
                      >
                        Cambiar
                      </button>
                    </div>
                  )}
                </div>

                {fieldErrors.course_id && (
                  <div className="field-error-message" role="alert">
                    <AlertCircle size={15} />
                    <span>{fieldErrors.course_id}</span>
                  </div>
                )}
              </Field>

              {/* 3. Detalles de la Publicación (Textareas con error inline) */}
              <Field
                label="3. Descripción Detallada"
                hint={`${form.description.length}/3000 caracteres`}
              >
                <textarea
                  required
                  maxLength={3000}
                  rows={5}
                  style={{ resize: "none" }}
                  className={fieldErrors.description ? "input-error" : ""}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="¿Cuál es el objetivo de estudio? Describe temas específicos, horarios tentativos o metas a cumplir en equipo."
                />
                {fieldErrors.description && (
                  <div className="field-error-message" role="alert">
                    <AlertCircle size={15} />
                    <span>{fieldErrors.description}</span>
                  </div>
                )}
              </Field>

              <div className="two-cols">
                <Field
                  label="Beneficios esperados"
                  hint="Qué lograrán resolver o aprender juntos."
                >
                  <textarea
                    required
                    maxLength={1000}
                    rows={3}
                    style={{ resize: "none" }}
                    className={fieldErrors.benefits ? "input-error" : ""}
                    value={form.benefits}
                    onChange={(e) => set("benefits", e.target.value)}
                    placeholder="Ejemplo: Preparar evaluaciones continuas, repasar código limpio y resolver dudas."
                  />
                  {fieldErrors.benefits && (
                    <div className="field-error-message" role="alert">
                      <AlertCircle size={15} />
                      <span>{fieldErrors.benefits}</span>
                    </div>
                  )}
                </Field>

                <Field
                  label="Requisitos sugeridos"
                  hint="Conocimientos o herramientas necesarias."
                >
                  <textarea
                    required
                    maxLength={1000}
                    rows={3}
                    style={{ resize: "none" }}
                    className={fieldErrors.requirements ? "input-error" : ""}
                    value={form.requirements}
                    onChange={(e) => set("requirements", e.target.value)}
                    placeholder="Ejemplo: Estar cursando la materia o tener instalado el entorno de desarrollo."
                  />
                  {fieldErrors.requirements && (
                    <div className="field-error-message" role="alert">
                      <AlertCircle size={15} />
                      <span>{fieldErrors.requirements}</span>
                    </div>
                  )}
                </Field>
              </div>

              {/* Botones de Acción */}
              <div className="button-row" style={{ marginTop: 20 }}>
                <button className="button" disabled={busy || !isOwner}>
                  {busy ? "Guardando…" : id ? "Guardar cambios" : "Publicar ahora"}
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

            {/* Columna Lateral: Vista Previa en Vivo */}
            <aside className="live-preview-panel">
              <div className="live-preview-header">
                <span className="live-preview-label">
                  <Eye size={15} />
                  Vista Previa en Vivo
                </span>
                <span className="badge">Tiempo Real</span>
              </div>

              <div className="panel live-preview-card">
                <article
                  className="post-card"
                  style={{ margin: 0, border: "none", boxShadow: "none" }}
                >
                  <div className="post-top">
                    <div className="person">
                      {displayAuthorPhoto ? (
                        <img
                          src={displayAuthorPhoto}
                          alt={displayAuthorName}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="avatar"
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "#0f172a",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          {authorInitials}
                        </div>
                      )}
                      <div>
                        <strong>{displayAuthorName}</strong>
                        <span>
                          {id ? "Autor de la publicación" : "Tu perfil (Vista previa)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="tags" style={{ marginTop: 12 }}>
                    <span
                      className={`tag ${
                        form.type === "tutoring" ? "purple" : ""
                      }`}
                    >
                      {form.type === "tutoring" ? "Asesoría" : "Grupo de Estudio"}
                    </span>
                    <span className="course-tag">
                      {activeCourse
                        ? formatCourseName(activeCourse.name)
                        : "Selecciona un curso"}
                    </span>
                    {activeCourse?.cycle && (
                      <span className="tag">
                        {activeCourse.cycle === 11
                          ? "Electivo"
                          : `Ciclo ${activeCourse.cycle}`}
                      </span>
                    )}
                    {form.type === "study_group" &&
                      groupMode === "existing" &&
                      selectedGroup && (
                        <span
                          className="tag"
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            border: "1px solid #bae6fd",
                          }}
                        >
                          Vinculado: {selectedGroup.name}
                        </span>
                      )}
                  </div>

                  <p className="post-description" style={{ marginTop: 12 }}>
                    {form.description.trim() || (
                      <span className="preview-placeholder-text">
                        Aquí se visualizará el objetivo y descripción de tu
                        publicación conforme escribes...
                      </span>
                    )}
                  </p>

                  <div className="post-details" style={{ marginTop: 12 }}>
                    <span>
                      <BookOpen size={15} />
                      {activeCourse?.cycle === 11
                        ? "Electivo"
                        : `Ciclo ${activeCourse?.cycle ?? "—"}`}
                    </span>
                    {form.type === "study_group" ? (
                      <span>
                        <Users size={15} />
                        {groupMode === "existing" && selectedGroup
                          ? `Capacidad: ${selectedGroup.maxCapacity ?? form.max_capacity} integrantes`
                          : `Hasta ${form.max_capacity} integrantes (máx. 8)`}
                      </span>
                    ) : (
                      <span>
                        <GraduationCap size={15} />
                        Asesoría académica
                      </span>
                    )}
                  </div>

                  {(form.benefits.trim() || form.requirements.trim()) && (
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 12,
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        fontSize: 13,
                      }}
                    >
                      {form.benefits.trim() && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 6,
                          }}
                        >
                          <Sparkles
                            size={14}
                            style={{
                              color: "#d97706",
                              marginTop: 2,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <strong>Beneficios:</strong> {form.benefits}
                          </div>
                        </div>
                      )}
                      {form.requirements.trim() && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 6,
                          }}
                        >
                          <CheckCircle2
                            size={14}
                            style={{
                              color: "#2563eb",
                              marginTop: 2,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <strong>Requisitos:</strong> {form.requirements}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              </div>
            </aside>
          </div>
        </div>
      )}

      {leaving && (
        <Modal
          title="¿Desea guardar los cambios?"
          close={() => setLeaving(false)}
        >
          <p className="confirmation-copy">
            Puedes guardar tu publicación antes de regresar, continuar editando o
            salir sin guardar los cambios.
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
