import { useEffect, useState, useRef, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { api } from "@/config/api";
import { useResource } from "@/hooks/useResource";
import { PageHeader, Loading, Notice, Modal, Field } from "@/components/ui";

import { Course, Publication } from "../types";

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
