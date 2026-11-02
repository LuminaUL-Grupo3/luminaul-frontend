import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Field, Modal, Notice } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { useCreateReportMutation } from "../hooks/useModerationQueries";
import {
  CONTENT_TYPE_LABELS,
  MODERATION_LIMITS,
  REPORT_REASONS,
  TargetContentType,
} from "../types";

const OTHER = "Otro motivo";

// Diálogo reutilizable para reportar una publicación, un mensaje o una reseña (HU 6.1).
// Lo usan ReportButton (posts y reseñas) y puede usarlo el chat.
export function ReportModal({
  targetType,
  targetId,
  close,
}: {
  targetType: TargetContentType;
  targetId: string;
  close: () => void;
}) {
  const feedback = useFeedback(),
    report = useCreateReportMutation(),
    [choice, setChoice] = useState(""),
    [detail, setDetail] = useState(""),
    [validation, setValidation] = useState("");

  const reason = (choice === OTHER ? detail : choice).trim();

  function submit(e: FormEvent) {
    e.preventDefault();
    const error = !reason
      ? "Selecciona o describe el motivo del reporte"
      : reason.length > MODERATION_LIMITS.MAX_REASON_LENGTH
        ? "El motivo no puede superar los 255 caracteres"
        : "";
    setValidation(error);
    if (error || report.isPending) return;
    report.mutate(
      { reason, targetType, targetId },
      {
        onSuccess: (response) => {
          feedback.notify(response.message);
          close();
        },
      },
    );
  }

  return (
    <Modal title={`Reportar ${CONTENT_TYPE_LABELS[targetType].toLowerCase()}`} close={close}>
      <form className="form" onSubmit={submit} noValidate>
        <Field label="Motivo">
          <select
            value={choice}
            onChange={(e) => {
              setChoice(e.target.value);
              setValidation("");
            }}
          >
            <option value="">Selecciona un motivo</option>
            {[...REPORT_REASONS, OTHER].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        {choice === OTHER && (
          <Field
            label="Describe el problema"
            hint={`${detail.length}/${MODERATION_LIMITS.MAX_REASON_LENGTH} caracteres`}
          >
            <textarea
              value={detail}
              maxLength={MODERATION_LIMITS.MAX_REASON_LENGTH}
              placeholder="Cuéntanos qué debemos revisar"
              onChange={(e) => {
                setDetail(e.target.value);
                setValidation("");
              }}
            />
          </Field>
        )}
        <Notice error>{validation || report.error?.message}</Notice>
        <button className="button" disabled={report.isPending}>
          {report.isPending ? <LoaderCircle className="spin" size={18} /> : null}
          {report.isPending ? "Enviando…" : "Enviar reporte"}
        </button>
        <button type="button" className="button secondary" onClick={close} disabled={report.isPending}>
          Cancelar
        </button>
      </form>
    </Modal>
  );
}
