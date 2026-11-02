import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Notice, Field } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { useCreateGroupMutation } from "../hooks/useGroupQueries";
import type { MeetingMode, MeetingShift } from "../types/contracts";

/** Crea un grupo dentro de SPEC-04 sin modificar el formulario de publicaciones de otro integrante. */
export function CreateGroupModal({ close }: { close: () => void }) {
  const navigate = useNavigate(),
    feedback = useFeedback(),
    mutation = useCreateGroupMutation();
  const [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [courseCode, setCourseCode] = useState("");
  const [mode, setMode] = useState<MeetingMode>("virtual"),
    [shift, setShift] = useState<MeetingShift>("tarde"),
    [capacity, setCapacity] = useState(6),
    [error, setError] = useState("");
  /** Informa validaciones en el modal de la aplicación y navega solo tras confirmar el alta. */
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mutation.isPending) return;
    if (name.trim().length < 2 || !courseCode.trim()) {
      setError("Completa el nombre y el código del curso.");
      return;
    }
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
      setError(
        "La capacidad debe estar entre 1 y 50 integrantes, incluyéndote.",
      );
      return;
    }
    setError("");
    try {
      const group = await mutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        courseCode: courseCode.trim().toUpperCase(),
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
        className="form spec04-modal"
        noValidate
        onSubmit={submit}
        aria-busy={mutation.isPending}
      >
        <Field label="Nombre del grupo">
          <input
            aria-label="Nombre del grupo"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            autoFocus
            placeholder="Por ejemplo, repaso de Cálculo"
          />
        </Field>
        <Field label="Descripción">
          <textarea
            aria-label="Descripción del grupo"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            placeholder="¿Qué les gustaría aprender juntos?"
          />
        </Field>
        <div className="two-cols">
          <Field label="Código del curso">
            <input
              aria-label="Código del curso"
              value={courseCode}
              onChange={(event) => setCourseCode(event.target.value)}
              maxLength={20}
              placeholder="ISW2"
            />
          </Field>
          <Field label="Capacidad">
            <input
              aria-label="Capacidad del grupo"
              type="number"
              min={1}
              max={50}
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
            />
          </Field>
        </div>
        <div className="two-cols">
          <Field label="Modalidad">
            <select
              aria-label="Modalidad del grupo"
              value={mode}
              onChange={(event) => setMode(event.target.value as MeetingMode)}
            >
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </Field>
          <Field label="Turno">
            <select
              aria-label="Turno del grupo"
              value={shift}
              onChange={(event) => setShift(event.target.value as MeetingShift)}
            >
              <option value="manana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </Field>
        </div>
        <Notice error>{error}</Notice>
        <button className="button" disabled={mutation.isPending}>
          {mutation.isPending ? "Creando…" : "Crear grupo"}
        </button>
        <button
          type="button"
          className="button secondary"
          disabled={mutation.isPending}
          onClick={close}
        >
          Cancelar
        </button>
      </form>
    </Modal>
  );
}
