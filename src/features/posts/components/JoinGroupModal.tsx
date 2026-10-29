import { useState } from "react";
import { Modal, ActionForm, Field } from "@/components/ui";
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

  return (
    <Modal
      title={`Unirme a ${post.group_name || "grupo"}`}
      close={onClose}
    >
      <ActionForm
        path={`/groups/${post.group_id}/join-requests`}
        payload={() => ({ message: message.trim() })}
        label="Enviar solicitud"
        validate={() =>
          message.trim() ? "" : "Escribe un mensaje para el administrador del grupo"
        }
        done={() => {
          onSuccess();
          onClose();
        }}
      >
        <Field label="Preséntate al grupo">
          <textarea
            required
            minLength={1}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Cuéntales qué te gustaría aprender…"
          />
        </Field>
      </ActionForm>
    </Modal>
  );
}
