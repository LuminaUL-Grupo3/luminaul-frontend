import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Field, Modal, Notice } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { useCreateAppealMutation } from "../hooks/useModerationQueries";
import { MODERATION_LIMITS, ModerationLogDto } from "../types";

const MIN_JUSTIFICATION = 10;

// Diálogo para apelar una moderación automática propia (HU 6.4)
export function AppealModal({ log, close }: { log: ModerationLogDto; close: () => void }) {
  const feedback = useFeedback(),
    appeal = useCreateAppealMutation(),
    [justification, setJustification] = useState(""),
    [validation, setValidation] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = justification.trim();
    const error =
      text.length < MIN_JUSTIFICATION
        ? `Explica el contexto en al menos ${MIN_JUSTIFICATION} caracteres`
        : text.length > MODERATION_LIMITS.MAX_JUSTIFICATION_LENGTH
          ? "La justificación no puede superar los 1000 caracteres"
          : "";
    setValidation(error);
    if (error || appeal.isPending) return;
    appeal.mutate(
      { moderationLogId: log.id, justification: text },
      {
        onSuccess: (response) => {
          feedback.notify(response.message);
          close();
        },
      },
    );
  }

  return (
    <Modal title="Apelar moderación" close={close}>
      <form className="form" onSubmit={submit} noValidate>
        {log.content && <blockquote className="muted">{log.content}</blockquote>}
        <p className="muted">
          Se ocultó por: <strong>{log.detectedWords.join(", ")}</strong>
        </p>
        <Field
          label="Justificación"
          hint={`${justification.length}/${MODERATION_LIMITS.MAX_JUSTIFICATION_LENGTH} caracteres`}
        >
          <textarea
            value={justification}
            maxLength={MODERATION_LIMITS.MAX_JUSTIFICATION_LENGTH}
            placeholder="Explica por qué crees que tu contenido no incumple las normas"
            onChange={(e) => {
              setJustification(e.target.value);
              setValidation("");
            }}
          />
        </Field>
        <Notice error>{validation || appeal.error?.message}</Notice>
        <button className="button" disabled={appeal.isPending}>
          {appeal.isPending ? <LoaderCircle className="spin" size={18} /> : null}
          {appeal.isPending ? "Enviando…" : "Enviar apelación"}
        </button>
        <button type="button" className="button secondary" onClick={close} disabled={appeal.isPending}>
          Cancelar
        </button>
      </form>
    </Modal>
  );
}
