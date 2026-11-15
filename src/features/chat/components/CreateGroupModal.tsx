import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Laptop,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  Sunset,
  Users,
} from "lucide-react";
import { Modal, Notice, Field } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { useCreateGroupMutation } from "../hooks/useGroupQueries";
import { api } from "../services/apiClient";
import type { MeetingMode, MeetingShift } from "../types/contracts";

interface CourseOption {
  id: string;
  name: string;
  cycle: number | null;
}

const MODE_OPTIONS: {
  value: MeetingMode;
  label: string;
  Icon: typeof Laptop;
}[] = [
  { value: "virtual", label: "Virtual", Icon: Laptop },
  { value: "presencial", label: "Presencial", Icon: MapPin },
  { value: "hibrido", label: "Híbrido", Icon: Sparkles },
];

const SHIFT_OPTIONS: {
  value: MeetingShift;
  label: string;
  Icon: typeof Sun;
}[] = [
  { value: "manana", label: "Mañana", Icon: Sun },
  { value: "tarde", label: "Tarde", Icon: Sunset },
  { value: "noche", label: "Noche", Icon: Moon },
];

/** Convierte el nombre completo del curso en un código legible de hasta 20 caracteres. */
function toCourseCode(courseName: string): string {
  const clean = courseName.trim().replace(/\s+/g, " ");
  if (clean.length <= 20) return clean.toUpperCase();

  const abbreviated = clean
    .replace(/\bIngenier[íi]a\b/gi, "Ing.")
    .replace(/\bProgramaci[óo]n\b/gi, "Prog.")
    .replace(/\bAdministraci[óo]n\b/gi, "Adm.")
    .replace(/\bArquitectura\b/gi, "Arq.")
    .replace(/\bEstad[íi]stica\b/gi, "Est.")
    .replace(/\bMatem[áa]tica\b/gi, "Mat.")
    .replace(/\bSistemas\b/gi, "Sist.")
    .replace(/\bDesarrollo\b/gi, "Des.")
    .replace(/\bGesti[óo]n\b/gi, "Gest.")
    .replace(/\bInvestigaci[óo]n\b/gi, "Inv.");

  if (abbreviated.length <= 20) return abbreviated.toUpperCase();
  return abbreviated.slice(0, 20).trim().toUpperCase();
}

/** Crea un grupo de estudio dentro de SPEC-04 alineado con los límites del proyecto. */
export function CreateGroupModal({ close }: { close: () => void }) {
  const navigate = useNavigate();
  const feedback = useFeedback();
  const mutation = useCreateGroupMutation();

  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.request<CourseOption[]>("/courses"),
    staleTime: 5 * 60 * 1000,
  });

  const courses = coursesQuery.data ?? [];
  const availableCycles = useMemo(() => {
    const set = new Set<number>();
    for (const c of courses) {
      if (typeof c.cycle === "number") set.add(c.cycle);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [courses]);

  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<MeetingMode>("virtual");
  const [shift, setShift] = useState<MeetingShift>("tarde");
  const [capacity, setCapacity] = useState(5);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  function clearFieldError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mutation.isPending) return;
    const errors: Record<string, string> = {};
    if (name.trim().length < 2) {
      errors.name = "Ingresa un nombre de al menos 2 caracteres.";
    }
    const selectedCourse = courses.find((c) => c.id === courseId);
    if (!selectedCourse) {
      errors.courseId = "Selecciona el curso del grupo.";
    }
    if (!Number.isInteger(capacity) || capacity < 2 || capacity > 8) {
      errors.capacity = "La capacidad debe estar entre 2 y 8 integrantes.";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("");
      return;
    }
    setFieldErrors({});
    setError("");
    if (!selectedCourse) return;
    try {
      const group = await mutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        courseCode: toCourseCode(selectedCourse.name),
        meetingMode: mode,
        meetingShift: shift,
        maxCapacity: capacity,
      });
      feedback.notify("Grupo creado. Ya puedes empezar a conversar.");
      close();
      navigate(`/grupos/${group.id}`);
    } catch (cause) {
      setError((cause as Error).message);
    }
  }

  return (
    <Modal title="Crear grupo de estudio" close={close}>
      <form
        className="form spec04-modal spec04-create-form"
        noValidate
        onSubmit={submit}
        aria-busy={mutation.isPending}
      >
        <div className="spec04-create-intro">
          <Users size={16} aria-hidden="true" />
          <span>
            Serás el líder del grupo y se habilitará automáticamente su sala de
            chat para coordinar sesiones.
          </span>
        </div>

        <Field label="Nombre del grupo" hint={`${name.length}/50`}>
          <input
            aria-label="Nombre del grupo"
            className={fieldErrors.name ? "input-error" : ""}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearFieldError("name");
            }}
            maxLength={50}
            autoFocus
            placeholder="Ej. Repaso semanal de Ingeniería de Software"
          />
          {fieldErrors.name && (
            <div className="field-error-message" role="alert">
              <AlertCircle size={15} />
              <span>{fieldErrors.name}</span>
            </div>
          )}
        </Field>

        <div className="two-cols">
          <Field label="Curso">
            <select
              aria-label="Curso del grupo"
              className={fieldErrors.courseId ? "input-error" : ""}
              value={courseId}
              onChange={(event) => {
                setCourseId(event.target.value);
                clearFieldError("courseId");
              }}
              disabled={coursesQuery.isPending}
            >
              <option value="">
                {coursesQuery.isPending
                  ? "Cargando cursos…"
                  : "Selecciona un curso"}
              </option>
              {availableCycles.map((cycleNum) => {
                const groupCourses = courses.filter(
                  (c) => c.cycle === cycleNum,
                );
                if (groupCourses.length === 0) return null;
                return (
                  <optgroup
                    key={cycleNum}
                    label={
                      cycleNum === 11
                        ? `Cursos Electivos (${groupCourses.length})`
                        : `Ciclo ${cycleNum} (${groupCourses.length})`
                    }
                  >
                    {groupCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            {fieldErrors.courseId && (
              <div className="field-error-message" role="alert">
                <AlertCircle size={15} />
                <span>{fieldErrors.courseId}</span>
              </div>
            )}
          </Field>

          <Field label="Capacidad máxima" hint="Mín. 2 y máx. 8 (incluyéndote)">
            <div className="spec04-capacity-control">
              <input
                type="range"
                min={2}
                max={8}
                step={1}
                value={capacity}
                onChange={(event) => {
                  const val = Math.min(8, Math.max(2, Number(event.target.value)));
                  setCapacity(val);
                  clearFieldError("capacity");
                }}
                aria-label="Capacidad del grupo"
              />
              <input
                aria-label="Número de integrantes"
                className={fieldErrors.capacity ? "input-error" : ""}
                type="number"
                min={2}
                max={8}
                value={capacity}
                onChange={(event) => {
                  const raw = Number(event.target.value);
                  if (Number.isNaN(raw)) return;
                  setCapacity(Math.min(8, Math.max(2, Math.trunc(raw))));
                  clearFieldError("capacity");
                }}
              />
            </div>
            {fieldErrors.capacity && (
              <div className="field-error-message" role="alert">
                <AlertCircle size={15} />
                <span>{fieldErrors.capacity}</span>
              </div>
            )}
          </Field>
        </div>

        <Field label="Descripción" hint={`${description.length}/500`}>
          <textarea
            aria-label="Descripción del grupo"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Cuéntales a otros alumnos qué temas repasarán y cómo trabajan."
          />
        </Field>

        <div className="two-cols">
          <div className="field">
            <span>Modalidad</span>
            <div
              className="spec04-pill-group"
              role="radiogroup"
              aria-label="Modalidad del grupo"
            >
              {MODE_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={mode === value}
                  className={`spec04-pill-option${mode === value ? " is-active" : ""}`}
                  onClick={() => setMode(value)}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Turno preferido</span>
            <div
              className="spec04-pill-group"
              role="radiogroup"
              aria-label="Turno del grupo"
            >
              {SHIFT_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={shift === value}
                  className={`spec04-pill-option${shift === value ? " is-active" : ""}`}
                  onClick={() => setShift(value)}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Notice error>{error}</Notice>

        <div className="spec04-create-actions">
          <button
            type="button"
            className="button secondary"
            disabled={mutation.isPending}
            onClick={close}
          >
            Cancelar
          </button>
          <button className="button" disabled={mutation.isPending}>
            {mutation.isPending ? "Creando grupo…" : "Crear grupo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
