import { FormEvent, useState } from "react";
import { Modal, Field, Notice } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { useChangeUserStatusMutation } from "../hooks/useAdminQueries";

// HU 7.1: el administrador debe elegir obligatoriamente un motivo de la lista
export const SUSPENSION_REASONS = [
  "Lenguaje ofensivo o insultos",
  "Spam o publicidad no solicitada",
  "Acoso a otros alumnos",
  "Fraude o plagio académico",
  "Reincidencia en contenido reportado",
] as const;

interface Props {
  user: { id: string; name: string };
  // true: suspender; false: reactivar
  suspend: boolean;
  close: () => void;
}

export function SuspendUserModal({ user, suspend, close }: Props) {
  const feedback = useFeedback();
  const mutation = useChangeUserStatusMutation();
  const [motive, setMotive] = useState(""),
    [detail, setDetail] = useState(""),
    [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const reason = suspend
      ? [motive, detail.trim()].filter(Boolean).join(". ")
      : detail.trim();
    if (suspend && !motive) {
      setError("Debes seleccionar un motivo de suspensión");
      return;
    }
    if (!reason) {
      setError("Debes indicar el motivo");
      return;
    }
    try {
      const result = await mutation.mutateAsync({
        id: user.id,
        payload: { status: suspend ? "suspended" : "active", reason },
      });
      feedback.notify(result.message);
      close();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <Modal title={suspend ? "Suspender cuenta" : "Reactivar cuenta"} close={close}>
      <form className="form" onSubmit={submit} noValidate>
        <p>
          {suspend
            ? `Se restringirá el acceso de ${user.name} y se cerrarán sus sesiones activas.`
            : `${user.name} podrá volver a iniciar sesión y recibirá una notificación.`}
        </p>
        {suspend && (
          <Field label="Motivo de suspensión">
            <select value={motive} onChange={(e) => setMotive(e.target.value)}>
              <option value="">Selecciona un motivo</option>
              {SUSPENSION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label={suspend ? "Detalle (opcional)" : "Motivo de la reactivación"}>
          <textarea
            maxLength={400}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        </Field>
        <Notice error>{error}</Notice>
        <button className="button" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando…" : "Confirmar"}
        </button>
        <button type="button" className="button secondary" onClick={close}>
          Cancelar
        </button>
      </form>
    </Modal>
  );
}
