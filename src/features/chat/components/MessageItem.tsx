import { useId, useState } from "react";
import { Reply, CheckCheck, Check } from "lucide-react";
import { Avatar, ReportButton } from "@/components/ui";
import {
  reactionEmojis,
  type GroupMessageDto,
  type ReactionEmoji,
} from "../types/contracts";

interface MessageItemProps {
  message: GroupMessageDto;
  userId: string;
  disabled: boolean;
  onReply: (message: GroupMessageDto) => void;
  onReaction: (id: string, emoji: ReactionEmoji, add: boolean) => Promise<void>;
}

/** Una burbuja conserva el ID definitivo, el estado de moderación y los recibos confirmados. */
export function MessageItem({
  message,
  userId,
  disabled,
  onReply,
  onReaction,
}: MessageItemProps) {
  const mine = message.senderId === userId,
    visible = message.status === "published";
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const longMessage =
    visible &&
    (message.content.length > 600 || message.content.split("\n").length > 8);
  /** Espera el ACK para no inventar un contador de reacciones cuando falla la red. */
  async function react(emoji: ReactionEmoji) {
    if (busy || disabled) return;
    setBusy(true);
    setError("");
    try {
      await onReaction(
        message.id,
        emoji,
        !message.reactions.some(
          (reaction) =>
            reaction.emoji === emoji && reaction.userIds.includes(userId),
        ),
      );
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article
      data-message-id={message.id}
      className={`bubble-row ${mine ? "mine" : ""} ${!visible ? "is-hidden" : ""}`}
    >
      {!mine && (
        <Avatar
          name={message.sender.name}
          src={message.sender.profilePhotoUrl || undefined}
        />
      )}
      <div className="spec04-message-content">
        <div className="bubble">
          <div className="bubble-top">
            <strong>{mine ? "Tú" : message.sender.name}</strong>
            <time dateTime={message.createdAt}>
              {new Date(message.createdAt).toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
          {message.replyTo && (
            <blockquote className="spec04-quoted">
              <strong>{message.replyTo.senderName}</strong>
              <span>
                {message.replyTo.status === "published" &&
                message.replyTo.content
                  ? message.replyTo.content
                  : "Mensaje no disponible"}
              </span>
            </blockquote>
          )}
          <p
            id={contentId}
            className={
              longMessage && !expanded ? "message-collapsed" : undefined
            }
          >
            {visible
              ? message.content
              : message.status === "hidden"
                ? "Mensaje oculto por moderación."
                : "Mensaje eliminado."}
          </p>
          {longMessage && (
            <button
              className="message-expand"
              type="button"
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Ver menos" : "Ver más"}
            </button>
          )}
          {mine && visible && (
            <small
              className="spec04-read"
              title={
                message.readBy.length
                  ? `Leído por ${message.readBy.map((reader) => reader.name).join(", ")}`
                  : "Guardado y confirmado por el servidor"
              }
            >
              {message.readBy.length ? (
                <CheckCheck size={14} />
              ) : (
                <Check size={14} />
              )}
              {message.readBy.length
                ? `Leído por ${message.readBy.length}`
                : "Enviado"}
            </small>
          )}
        </div>
        {visible && (
          <div className="spec04-message-actions">
            {!mine && (
              <ReportButton
                kind="message"
                id={message.id}
                disabled={disabled}
              />
            )}
            <button
              className="text-button"
              aria-label={`Responder a ${message.sender.name}`}
              onClick={() => onReply(message)}
              disabled={disabled}
            >
              <Reply size={14} />
              Responder
            </button>
            <div
              className="spec04-reactions"
              aria-label="Reacciones al mensaje"
            >
              {reactionEmojis.map((emoji) => {
                const reaction = message.reactions.find(
                    (value) => value.emoji === emoji,
                  ),
                  selected = Boolean(reaction?.userIds.includes(userId));
                return (
                  <button
                    type="button"
                    key={emoji}
                    aria-label={`Reaccionar ${emoji}`}
                    aria-pressed={selected}
                    disabled={disabled || busy}
                    className={`spec04-reaction ${selected ? "selected" : ""}`}
                    onClick={() => void react(emoji)}
                  >
                    {emoji}
                    {reaction?.userIds.length ? (
                      <span>{reaction.userIds.length}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {error && (
          <small className="field-error" role="alert">
            {error}
          </small>
        )}
      </div>
    </article>
  );
}
