import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Field, Modal, Notice } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import {
  useCreateTutoringRequestMutation,
  useJoinGroupMutation,
} from "../hooks/usePostsQueries";
import { Publication } from "../types";

interface JoinGroupModalProps {
  post: Publication;
  onClose: () => void;
  onSuccess: () => void;
}

export function JoinGroupModal({
  post,
  onClose,
  onSuccess,
}: JoinGroupModalProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const feedback = useFeedback();
  const joinMutation = useJoinGroupMutation();
  const tutoringMutation = useCreateTutoringRequestMutation();
  const isTutoring = post.type === "tutoring" && !post.groupId;
  const isPending = isTutoring
    ? tutoringMutation.isPending
    : joinMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const trimmed = message.trim();
    if (!trimmed) {
      setError(
        isTutoring
          ? "Escribe un mensaje para el asesor"
          : "Escribe un mensaje para el líder del grupo",
      );
      return;
    }
    if (!isTutoring && !post.groupId) {
      setError("Esta publicación no tiene un grupo vinculado.");
      return;
    }
    setError("");
    try {
      if (isTutoring) {
        const result = await tutoringMutation.mutateAsync({
          postId: post.id,
          message: trimmed,
        });
        feedback.notify(result.message || "Solicitud de asesoría enviada");
      } else {
        const result = await joinMutation.mutateAsync({
          groupId: post.groupId!,
          message: trimmed,
        });
        feedback.notify(result.message || "Solicitud enviada al líder del grupo");
      }
      onSuccess();
      onClose();
    } catch (cause) {
      setError((cause as Error).message);
    }
  }

  return (
    <Modal
      title={
        isTutoring
          ? post.course?.name
            ? `Solicitar asesoría de ${post.course.name}`
            : "Solicitar asesoría"
          : post.course?.name
            ? `Unirme al grupo de ${post.course.name}`
            : "Unirme al grupo"
      }
      close={onClose}
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field
          label={isTutoring ? "Mensaje para el asesor" : "Preséntate al grupo"}
          hint={`${message.length}/255 caracteres`}
        >
          <textarea
            required
            minLength={1}
            maxLength={255}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isTutoring
                ? "Cuéntale qué temas necesitas reforzar o tu disponibilidad…"
                : "Cuéntales qué te gustaría aprender…"
            }
          />
        </Field>
        <Notice error>{error}</Notice>
        <button className="button" disabled={isPending}>
          {isPending ? <LoaderCircle className="spin" size={18} /> : null}
          {isPending ? "Enviando…" : "Enviar solicitud"}
          <ArrowRight size={16} />
        </button>
      </form>
    </Modal>
  );
}
