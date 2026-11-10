import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Modal, Field, Notice } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import {
  useCreateAvailabilityMutation,
  useUpdateAvailabilityMutation,
} from "../hooks/useProfileQueries";
import { AvailabilitySlotDto, DAYS_OF_WEEK, DayOfWeek } from "../types";

const EARLIEST_TIME = "07:00";
const LATEST_TIME = "22:00";
const RANGE_LABEL = "entre las 7:00 a. m. y las 10:00 p. m.";

const outOfRange = (time: string) =>
  time < EARLIEST_TIME || time > LATEST_TIME;

export interface AvailabilityModalProps {
  edit: AvailabilitySlotDto | null;
  close: () => void;
  done: () => void;
}

export function AvailabilityModal({
  edit,
  close,
  done,
}: AvailabilityModalProps) {
  const feedback = useFeedback();
  const createSlot = useCreateAvailabilityMutation(),
    updateSlot = useUpdateAvailabilityMutation(),
    [day, setDay] = useState<DayOfWeek>(edit?.dayOfWeek || "lunes"),
    [start, setStart] = useState(edit?.startTime || "10:00"),
    [end, setEnd] = useState(edit?.endTime || "12:00"),
    [error, setError] = useState("");
  const busy = createSlot.isPending || updateSlot.isPending;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!start || !end) {
      setError("Ingresa la hora de inicio y la hora de fin");
      return;
    }
    if (outOfRange(start)) {
      setError(`La hora de inicio debe estar ${RANGE_LABEL}`);
      return;
    }
    if (outOfRange(end)) {
      setError(`La hora de fin debe estar ${RANGE_LABEL}`);
      return;
    }
    if (start >= end) {
      setError("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }
    setError("");
    const payload = { dayOfWeek: day, startTime: start, endTime: end };
    try {
      const result = edit
        ? await updateSlot.mutateAsync({ id: edit.id, payload })
        : await createSlot.mutateAsync(payload);
      feedback.notify(result.message);
      done();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <Modal
      title={edit ? "Editar franja" : "Agregar horas libres"}
      close={close}
    >
      {/* noValidate: el aviso nativo del navegador sale en inglés ("Value must be 07:00 or later"),
          así que el rango se valida en submit con mensajes en español */}
      <form className="form" noValidate onSubmit={submit}>
        <Field label="Día">
          <select
            value={day}
            onChange={(e) => setDay(e.target.value as DayOfWeek)}
          >
            {DAYS_OF_WEEK.map((d) => (
              <option value={d.value} key={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="two-cols">
          <Field label="Desde">
            <input
              type="time"
              required
              min={EARLIEST_TIME}
              max={LATEST_TIME}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="Hasta">
            <input
              type="time"
              required
              min={EARLIEST_TIME}
              max={LATEST_TIME}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
        </div>
        <Notice error>{error}</Notice>
        <button className="button" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={18} /> : null}
          {busy ? "Guardando…" : "Guardar horario"}
          <ArrowRight size={16} />
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={close}
          disabled={busy}
        >
          Cancelar
        </button>
      </form>
    </Modal>
  );
}
