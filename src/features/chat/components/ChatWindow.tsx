import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  MessageCircle,
  Send,
  Users,
  X,
  WifiOff,
} from "lucide-react";
import { Loading, Notice } from "@/components/ui";
import { MessageItem } from "./MessageItem";
import type {
  GroupDetailDto,
  GroupMessageDto,
  ReactionEmoji,
  SendMessageRequest,
} from "../types/contracts";

export interface ChatWindowProps {
  group?: GroupDetailDto;
  groupId: string;
  userId: string;
  connected: boolean;
  revoked: boolean;
  messages: GroupMessageDto[];
  loading: boolean;
  more: boolean;
  loadingMore: boolean;
  error?: string;
  onlineIds: string[];
  typingNames: string[];
  onLoadMore: () => Promise<void>;
  onSendMessage: (payload: SendMessageRequest) => Promise<GroupMessageDto>;
  onTyping: (typing: boolean) => void;
  onReaction: (id: string, emoji: ReactionEmoji, add: boolean) => Promise<void>;
  onRead: (id: string) => Promise<void>;
}

/** Conversación accesible con borrador conservado, scroll estable y envío confirmado por ACK. */
export function ChatWindow(props: ChatWindowProps) {
  const {
    group,
    groupId,
    userId,
    connected,
    revoked,
    messages,
    loading,
    more,
    loadingMore,
    error,
    onlineIds,
    typingNames,
    onLoadMore,
    onSendMessage,
    onTyping,
    onReaction,
    onRead,
  } = props;
  const [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [sendError, setSendError] = useState("");
  const [reply, setReply] = useState<GroupMessageDto | null>(null),
    [atBottom, setAtBottom] = useState(true);
  const stream = useRef<HTMLDivElement>(null),
    end = useRef<HTMLDivElement>(null),
    field = useRef<HTMLTextAreaElement>(null);
  const previousLast = useRef(""),
    readId = useRef(""),
    pending = useRef<{
      content: string;
      replyToId?: string;
      id: string;
    } | null>(null);
  const stickyBottom = useRef(true);
  const sending = useRef(false),
    draftVersion = useRef(0);
  const scrollSnapshot = useRef<{ top: number; height: number } | null>(null);
  const latest = messages.at(-1)?.id || "";

  // El compositor crece con el texto sin desplazar el historial que el usuario está leyendo.
  useLayoutEffect(() => {
    if (!field.current) return;
    field.current.style.height = "auto";
    field.current.style.height = `${Math.min(field.current.scrollHeight, 140)}px`;
  }, [text]);

  useEffect(() => {
    if (
      reply &&
      messages.some(
        (message) => message.id === reply.id && message.status !== "published",
      )
    ) {
      setReply(null);
      pending.current = null;
    }
  }, [messages, reply]);

  /** Lee solo si el último mensaje está dentro de la vista y la pestaña está activa y enfocada. */
  function readVisible() {
    if (
      !connected ||
      revoked ||
      !latest ||
      latest === readId.current ||
      document.visibilityState !== "visible" ||
      !document.hasFocus()
    )
      return;
    const box = stream.current?.getBoundingClientRect(),
      marker = end.current?.getBoundingClientRect();
    if (
      !box ||
      !marker ||
      marker.bottom > Math.min(box.bottom, window.innerHeight) + 2 ||
      marker.top < box.top
    )
      return;
    readId.current = latest;
    void onRead(latest).catch(() => {
      if (readId.current === latest) readId.current = "";
    });
  }

  useLayoutEffect(() => {
    const box = stream.current;
    if (!box) return;
    if (scrollSnapshot.current) {
      box.scrollTop =
        scrollSnapshot.current.top +
        box.scrollHeight -
        scrollSnapshot.current.height;
      scrollSnapshot.current = null;
    } else if (previousLast.current !== latest && atBottom)
      box.scrollTop = box.scrollHeight;
    previousLast.current = latest;
    const frame = requestAnimationFrame(readVisible);
    return () => cancelAnimationFrame(frame);
  }, [messages, latest, connected]);

  useEffect(() => {
    document.addEventListener("visibilitychange", readVisible);
    window.addEventListener("focus", readVisible);
    return () => {
      document.removeEventListener("visibilitychange", readVisible);
      window.removeEventListener("focus", readVisible);
    };
  }, [latest, connected, revoked, onRead]);

  useEffect(() => {
    const box = stream.current;
    if (!box) return;
    // Al abrir el teclado móvil o cambiar de tamaño, conserva el final solo si el usuario ya estaba allí.
    const observer = new ResizeObserver(() => {
      if (stickyBottom.current) {
        box.scrollTop = box.scrollHeight;
        requestAnimationFrame(readVisible);
      }
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [latest, connected, revoked, onRead]);

  /** Al cargar mensajes antiguos conserva el punto de lectura, sin saltar al final de la conversación. */
  async function older() {
    if (!stream.current || loadingMore) return;
    scrollSnapshot.current = {
      top: stream.current.scrollTop,
      height: stream.current.scrollHeight,
    };
    try {
      await onLoadMore();
    } catch {
      scrollSnapshot.current = null;
    }
  }

  /** Una respuesta se prepara en el mismo compositor y no permite citar texto oculto. */
  function respond(message: GroupMessageDto) {
    draftVersion.current += 1;
    setReply(message);
    pending.current = null;
    field.current?.focus();
  }

  /** Reintenta con la misma clave cuando no llegó el ACK, conservando texto y cita si hay un fallo. */
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || sending.current || !connected || revoked) return;
    sending.current = true;
    const version = draftVersion.current;
    const content = text.trim(),
      replyToId = reply?.id;
    const attempt =
      pending.current?.content === content &&
      pending.current.replyToId === replyToId
        ? pending.current
        : { content, replyToId, id: crypto.randomUUID() };
    pending.current = attempt;
    setBusy(true);
    setSendError("");
    onTyping(false);
    try {
      await onSendMessage({
        groupId,
        content,
        clientMessageId: attempt.id,
        ...(replyToId ? { replyToId } : {}),
      });
      // Un ACK tardío no debe borrar el siguiente texto que el usuario ya está escribiendo.
      if (draftVersion.current === version) {
        setText("");
        setReply(null);
      }
      pending.current = null;
      setAtBottom(true);
      requestAnimationFrame(() => {
        if (stream.current)
          stream.current.scrollTop = stream.current.scrollHeight;
        field.current?.focus();
      });
    } catch (cause) {
      setSendError((cause as Error).message);
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  if (!groupId)
    return (
      <section className="chat-main">
        <div className="empty chat-empty">
          <span className="spec04-empty-icon">
            <MessageCircle size={40} />
          </span>
          <h2>Una buena idea empieza conversando.</h2>
          <p>
            Elige un grupo para coordinar, resolver dudas y compartir lo que
            sabes.
          </p>
          <Link className="button secondary" to="/grupos">
            Ver mis grupos
          </Link>
        </div>
      </section>
    );

  return (
    <section className="chat-main" aria-label="Conversación del grupo">
      <header className="chat-header">
        <div className="spec04-chat-heading">
          <Link
            className="icon-button spec04-back"
            to="/mensajes"
            aria-label="Volver a conversaciones"
          >
            <ArrowLeft size={20} />
          </Link>
          <span className="chat-icon">
            <Users size={22} />
          </span>
          <div>
            <h2>{group?.name || "Conversación"}</h2>
            <span className="chat-status">
              <span className={`status-dot ${connected ? "online" : ""}`} />
              {revoked
                ? "Acceso finalizado"
                : connected
                  ? `${onlineIds.length} ${onlineIds.length === 1 ? "persona conectada" : "personas conectadas"}`
                  : "Reconectando…"}
            </span>
          </div>
        </div>
        <Link to={`/grupos/${groupId}`} className="button secondary small">
          Ver integrantes
        </Link>
      </header>
      {!connected && !revoked && !loading && (
        <div className="spec04-connection" role="status">
          <WifiOff size={16} />
          Tu borrador se conserva mientras recuperamos la conexión.
        </div>
      )}
      <Notice error>{sendError || error}</Notice>
      <div
        className="chat-stream"
        ref={stream}
        onScroll={() => {
          const box = stream.current!;
          const nearEnd =
            box.scrollHeight - box.scrollTop - box.clientHeight < 60;
          stickyBottom.current = nearEnd;
          setAtBottom(nearEnd);
          readVisible();
        }}
      >
        {loading && <Loading />}
        {more && (
          <button
            className="button secondary small self-center"
            disabled={loadingMore}
            onClick={() => void older()}
          >
            {loadingMore ? "Cargando…" : "Cargar mensajes anteriores"}
          </button>
        )}
        {!loading && !messages.length && !revoked && (
          <div className="spec04-first-message">
            <MessageCircle size={24} />
            <strong>Este espacio es de ustedes.</strong>
            <p>Saluda al grupo y empieza la conversación.</p>
          </div>
        )}
        {!revoked &&
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              userId={userId}
              disabled={!connected}
              onReply={respond}
              onReaction={onReaction}
            />
          ))}
        <div ref={end} className="spec04-stream-end" />
      </div>
      {!atBottom && messages.length > 0 && (
        <button
          className="spec04-new-messages"
          onClick={() => {
            const box = stream.current;
            if (box) {
              box.scrollTop = box.scrollHeight;
              setAtBottom(true);
              requestAnimationFrame(readVisible);
            }
          }}
        >
          <ArrowDown size={15} />
          Ir al último mensaje
        </button>
      )}
      <div className="spec04-typing" role="status" aria-live="polite">
        {typingNames.length
          ? `${typingNames.slice(0, 2).join(" y ")} ${typingNames.length === 1 ? "está escribiendo" : "están escribiendo"}…`
          : ""}
      </div>
      {reply && (
        <div className="spec04-reply-draft">
          <div>
            <strong>Respondiendo a {reply.sender.name}</strong>
            <span>
              {reply.status === "published"
                ? reply.content
                : "Mensaje no disponible"}
            </span>
          </div>
          <button
            className="icon-button"
            aria-label="Cancelar respuesta"
            onClick={() => {
              draftVersion.current += 1;
              setReply(null);
              pending.current = null;
            }}
          >
            <X size={17} />
          </button>
        </div>
      )}
      <form className="chat-input" onSubmit={submit}>
        <textarea
          ref={field}
          aria-label="Mensaje"
          rows={1}
          maxLength={4000}
          value={text}
          disabled={revoked}
          placeholder={
            revoked
              ? "Ya no perteneces a este grupo."
              : "Escribe un mensaje para el grupo…"
          }
          onChange={(event) => {
            draftVersion.current += 1;
            setText(event.target.value);
            onTyping(Boolean(event.target.value.trim()));
          }}
          onBlur={() => onTyping(false)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              void submit(event);
            }
          }}
        />
        <button
          className="button"
          aria-label="Enviar mensaje"
          disabled={!text.trim() || busy || !connected || revoked}
        >
          <Send size={18} />
          <span>{busy ? "Enviando…" : "Enviar"}</span>
        </button>
      </form>
      <span className="spec04-composer-hint">
        Enter para enviar · Mayús + Enter para una nueva línea
      </span>
    </section>
  );
}
