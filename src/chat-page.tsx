import { useEffect, useRef, useState, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Send, Search, Users, MessageCircle } from "lucide-react";
import { api, Chat, Message, date } from "./api";
import { useSession } from "./session";
import {
  useResource,
  PageHeader,
  Loading,
  Notice,
  Empty,
  ReportButton,
} from "./ui";
export function ChatPage() {
  const { id } = useParams(),
    navigate = useNavigate(),
    { user } = useSession();
  const chats = useResource<Chat[]>("/chats", []),
    [messages, setMessages] = useState<Message[]>([]),
    [text, setText] = useState(""),
    [search, setSearch] = useState(""),
    [error, setError] = useState(""),
    [connected, setConnected] = useState(false),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [more, setMore] = useState(false);
  const socket = useRef<Socket | null>(null),
    end = useRef<HTMLDivElement>(null),
    active = useRef(id);
  active.current = id;
  async function history(group: string) {
    setLoading(true);
    try {
      const rows = await api.request<Message[]>(
        `/groups/${group}/messages?limit=50`,
      );
      if (active.current === group) {
        setMessages((previous) =>
          [
            ...new Map(
              [...rows, ...previous.filter((m) => m.group_id === group)].map(
                (m) => [m.id, m],
              ),
            ).values(),
          ].sort(
            (a, b) =>
              a.created_at.localeCompare(b.created_at) ||
              a.id.localeCompare(b.id),
          ),
        );
        setMore(rows.length === 50);
        await api.request(`/groups/${group}/read`, "POST");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    setMessages([]);
    setError("");
    if (id) void history(id);
  }, [id]);
  useEffect(() => {
    const s = io({ withCredentials: true });
    socket.current = s;
    s.on("session.ready", () => {
      setConnected(true);
      if (active.current) void history(active.current);
    });
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", () =>
      setError("No se pudo conectar al chat. Intenta recargar."),
    );
    s.on("chat.message", (m: Message) => {
      chats.reload();
      if (m.group_id === active.current) {
        setMessages((prev) =>
          prev.some((x) => x.id === m.id) ? prev : [...prev, m],
        );
        void api
          .request(`/groups/${m.group_id}/read`, "POST")
          .catch((e) => setError((e as Error).message));
      }
    });
    s.on("group.removed", (e: { groupId: string }) => {
      chats.reload();
      if (e.groupId === active.current) {
        setMessages([]);
        navigate("/mensajes");
        setError("Ya no perteneces a ese grupo.");
      }
    });
    return () => {
      s.disconnect();
      socket.current = null;
    };
  }, [user?.id]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !id || busy || !connected) return;
    setBusy(true);
    setError("");
    const payload = {
      group_id: id,
      content: text.trim(),
      client_id: crypto.randomUUID(),
    };
    socket.current
      ?.timeout(8000)
      .emit(
        "chat.send",
        payload,
        (
          err: Error | null,
          result: { ok: boolean; message?: string; data: Message },
        ) => {
          setBusy(false);
          if (err) {
            setError(
              "No llegó la confirmación. El mensaje pudo guardarse; recarga el historial antes de reenviarlo.",
            );
            return;
          }
          if (!result.ok) {
            setError(result.message || "No se pudo enviar");
            return;
          }
          setText("");
          if (result.data.status !== "published")
            setError(
              "Tu mensaje fue moderado. Puedes revisarlo en Moderación.",
            );
          else {
            setMessages((prev) =>
              prev.some((x) => x.id === result.data.id)
                ? prev
                : [...prev, result.data],
            );
            chats.reload();
          }
        },
      );
  }
  const selected = chats.data.find((c) => c.id === id);
  return (
    <>
      <PageHeader
        eyebrow="CONVERSACIONES QUE CONECTAN"
        title="Mensajes"
        description="Coordina, comparte ideas y aprende con tu grupo."
      />
      <div className="chat-shell">
        <aside className="chat-inbox">
          <label className="search-input">
            <Search size={17} />
            <input
              aria-label="Buscar chats"
              placeholder="Buscar un grupo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <Notice error>{chats.error}</Notice>
          {chats.loading ? (
            <Loading />
          ) : (
            chats.data
              .filter((c) =>
                c.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((c) => (
                <Link
                  className={`chat-preview ${id === c.id ? "active" : ""}`}
                  key={c.id}
                  to={`/mensajes/${c.id}`}
                >
                  <span className="icon-tile">
                    <MessageCircle size={20} />
                  </span>
                  <div>
                    <strong>{c.name}</strong>
                    <span>{c.last_message || "Empieza la conversación"}</span>
                  </div>
                  {c.unread > 0 && <b className="unread">{c.unread}</b>}
                </Link>
              ))
          )}
          {!chats.loading && !chats.data.length && (
            <Empty title="Aún no tienes conversaciones activas" />
          )}
        </aside>
        <section className="chat-conversation">
          {id ? (
            <>
              <header className="chat-header">
                <div>
                  <strong>{selected?.name || "Conversación del grupo"}</strong>
                  <span className={`connection ${connected ? "online" : ""}`}>
                    {connected ? "Conectado en tiempo real" : "Reconectando…"}
                  </span>
                </div>
                <Link
                  className="icon-button"
                  title="Ver integrantes"
                  to={`/grupos/${id}`}
                >
                  <Users size={20} />
                </Link>
              </header>
              <Notice error>{error}</Notice>
              <div className="chat-messages">
                {loading ? (
                  <Loading />
                ) : (
                  <>
                    {more && (
                      <button
                        className="text-button"
                        onClick={async () => {
                          try {
                            const rows = await api.request<Message[]>(
                              `/groups/${id}/messages?limit=50&offset=${messages.length}`,
                            );
                            setMessages((prev) => [
                              ...rows.filter(
                                (r) => !prev.some((p) => p.id === r.id),
                              ),
                              ...prev,
                            ]);
                            setMore(rows.length === 50);
                          } catch (e) {
                            setError((e as Error).message);
                          }
                        }}
                      >
                        Cargar mensajes anteriores
                      </button>
                    )}
                    {messages.map((m) => (
                      <article
                        key={m.id}
                        className={`message ${m.sender_id === user?.id ? "own" : ""}`}
                      >
                        <div className="message-meta">
                          <Link to={`/perfil/${m.sender_id}`}>
                            {m.sender_id === user?.id ? "Tú" : m.author_name}
                          </Link>
                          <ReportButton kind="message" id={m.id} />
                        </div>
                        <p>{m.content}</p>
                        <time>{date(m.created_at)}</time>
                      </article>
                    ))}
                    <div ref={end} />
                  </>
                )}
              </div>
              <form className="chat-composer" onSubmit={send}>
                <input
                  aria-label="Mensaje"
                  placeholder="Escribe un mensaje…"
                  maxLength={2000}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  className="button"
                  disabled={!connected || !text.trim() || busy}
                  aria-label="Enviar mensaje"
                >
                  <Send size={18} />
                  <span>{busy ? "Enviando…" : "Enviar"}</span>
                </button>
              </form>
            </>
          ) : (
            <Empty title="Una conversación puede ser el comienzo.">
              Selecciona un grupo para conversar.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
