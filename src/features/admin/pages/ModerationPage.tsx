import { useState } from "react";
import { date } from "@/config/api";
import { useResource } from "@/hooks/useResource";
import {
  PageHeader,
  Loading,
  Notice,
  Empty,
  Modal,
  ActionForm,
  Field,
} from "@/components/ui";
import { Moderated } from "../types";

export function ModerationPage() {
  const data = useResource<Moderated[]>("/moderation/me", []),
    [selected, setSelected] = useState<Moderated | null>(null),
    [justification, setJustification] = useState("");

  return (
    <>
      <PageHeader
        eyebrow="UNA COMUNIDAD CON RESPETO"
        title="Mis contenidos moderados"
        description="Consulta las decisiones y solicita una revisión cuando sea necesario."
      />
      <Notice error>{data.error}</Notice>
      {data.loading ? (
        <Loading />
      ) : data.data.length ? (
        <div className="stack">
          {data.data.map((c) => (
            <article className="panel" key={c.id}>
              <span className="tag warning">
                {c.publication_id
                  ? "Publicación"
                  : c.message_id
                    ? "Mensaje"
                    : "Reseña"}{" "}
                ·{" "}
                {c.appeal_status === "approved"
                  ? "Apelación aprobada"
                  : c.result === "hidden"
                    ? "Contenido oculto"
                    : "En revisión"}
              </span>
              <p>{c.content}</p>
              <p className="muted">
                {c.reason} · {date(c.created_at)}
              </p>
              {c.appeal_status ? (
                <span className="small-label">
                  Apelación:{" "}
                  {c.appeal_status === "pending"
                    ? "pendiente"
                    : c.appeal_status === "approved"
                      ? "aprobada"
                      : "rechazada"}
                </span>
              ) : (
                <button
                  className="button secondary small"
                  onClick={() => {
                    setSelected(c);
                    setJustification("");
                  }}
                >
                  Apelar decisión
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <Empty title="No tienes contenido moderado">
          Gracias por ayudar a mantener una comunidad respetuosa.
        </Empty>
      )}
      {selected && (
        <Modal title="Solicitar revisión" close={() => setSelected(null)}>
          <ActionForm
            path="/appeals"
            payload={() => ({ moderation_log_id: selected.id, justification })}
            label="Enviar apelación"
            done={() => {
              setSelected(null);
              data.reload();
            }}
          >
            <Field
              label="Justificación"
              hint="Explica el contexto. Al menos 10 caracteres."
            >
              <textarea
                required
                minLength={10}
                maxLength={1500}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
              />
            </Field>
          </ActionForm>
        </Modal>
      )}
    </>
  );
}
