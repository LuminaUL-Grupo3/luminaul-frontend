import { FormEvent, useState } from "react";
import { Field, Modal, Notice } from "../../../components/ui";
import { useFeedback } from "../../../hooks/useFeedback";
import { SubmitButton } from "./SubmitButton";
import { errorMessage, useDeleteAccountMutation } from "../hooks/useAuthMutations";
import "../styles/auth.css";

const CONFIRMATION_WORD = "ELIMINAR";

// Confirmación irreversible: hay que escribir la palabra para habilitar el borrado.
// Pensado para la página de configuración (SPEC-02); este feature solo expone el modal.
export function DeleteAccountModal({ close }: { close: () => void }) {
  const feedback = useFeedback();
  const remove = useDeleteAccountMutation();
  const [confirmation, setConfirmation] = useState("");
  const confirmed = confirmation.trim().toUpperCase() === CONFIRMATION_WORD;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!confirmed) return;
    remove.mutate(undefined, { onSuccess: (res) => feedback.notify(res.message) });
  }

  return (
    <Modal title="¿Eliminar tu cuenta?" close={() => !remove.isPending && close()}>
      <p className="confirmation-copy">
        Se cerrarán todas tus sesiones y ya no podrás iniciar sesión con este correo. Esta
        acción no se puede deshacer.
      </p>
      <form className="form" onSubmit={submit} noValidate>
        <Field label={`Escribe ${CONFIRMATION_WORD} para confirmar`}>
          <input
            className="delete-confirm-input"
            autoComplete="off"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={CONFIRMATION_WORD}
          />
        </Field>
        <Notice error>{remove.error ? errorMessage(remove.error) : ""}</Notice>
        <div className="modal-actions">
          <button
            type="button"
            className="button secondary"
            onClick={close}
            disabled={remove.isPending}
          >
            Conservar mi cuenta
          </button>
          <SubmitButton
            pending={remove.isPending}
            pendingLabel="Eliminando…"
            className="button danger-button"
            disabled={!confirmed}
          >
            Eliminar mi cuenta
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
