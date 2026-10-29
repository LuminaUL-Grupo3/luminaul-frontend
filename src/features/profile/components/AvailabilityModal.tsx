import { useState } from "react";
import { days } from "@/config/api";
import { Modal, Field, ActionForm } from "@/components/ui";
import { Availability } from "../types";

export interface AvailabilityModalProps {
  edit: Availability | null;
  close: () => void;
  done: () => void;
}

export function AvailabilityModal({
  edit,
  close,
  done,
}: AvailabilityModalProps) {
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
