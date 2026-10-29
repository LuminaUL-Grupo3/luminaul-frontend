import { useState, useRef, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Send, MessageCircle } from "lucide-react";
import { date } from "@/config/api";
import { Loading, Notice, ReportButton } from "@/components/ui";
import { Message } from "../types";

export interface ChatWindowProps {
  groupId?: string;
  groupName?: string;
  connected: boolean;
  messages: Message[];
  loading: boolean;
  more: boolean;
  error?: string;
  userId?: string;
  onLoadMore: () => void;
  onSendMessage: (content: string) => Promise<void>;
}

export function ChatWindow({
  groupId,
  groupName,
  connected,
  messages,
  loading,
  more,
  error,
  userId,
  onLoadMore,
  onSendMessage,
}: ChatWindowProps) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !groupId || busy) return;
    const content = text.trim();
    setText("");
    setBusy(true);
    try {
      await onSendMessage(content);
    } catch {
      setText(content);
    } finally {
      setBusy(false);
    }
  }

  if (!groupId) {
    return (
      <section className="chat-main">
        <div className="empty chat-empty">
          <MessageCircle size={44} />
          <h3>Elige una conversación para comenzar</h3>
          <p>
            Los mensajes que envíes se comparten con todos los integrantes del
            grupo.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-main">
      <header className="chat-header">
        <div>
          <h3>{groupName || "Conversación"}</h3>
          <span className="chat-status">
            <span className={`status-dot ${connected ? "online" : ""}`} />
            {connected
              ? "Conectado en tiempo real"
              : "Conectando al servidor…"}
          </span>
        </div>
        <div className="button-row">
          <Link to={`/grupos/${groupId}`} className="button secondary small">
            Ver detalles del grupo
          </Link>
        </div>
      </header>
      <Notice error>{error}</Notice>
      <div className="chat-stream">
        {loading && <Loading />}
        {more && (
          <button
            className="button secondary small self-center"
            onClick={onLoadMore}
          >
            Cargar mensajes anteriores
          </button>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`bubble-row ${mine ? "mine" : ""}`}>
              <div className="bubble">
                <div className="bubble-top">
                  <strong>{m.author_name}</strong>
                  <span>{date(m.created_at)}</span>
                  {!mine && <ReportButton kind="message" id={m.id} />}
                </div>
                <p>{m.content}</p>
                {m.status && m.status !== "published" && (
                  <small className="muted">
                    {m.status === "hidden"
                      ? "Oculto por moderación"
                      : "En revisión"}
                  </small>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          aria-label="Mensaje"
          placeholder="Escribe un mensaje para el grupo…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="button"
          disabled={!text.trim() || busy}
          aria-label="Enviar mensaje"
        >
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}
