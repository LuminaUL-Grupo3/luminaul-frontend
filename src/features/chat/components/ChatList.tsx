import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Users, MessageCircle } from "lucide-react";
import { Loading, Notice } from "@/components/ui";
import type { GroupDetailDto } from "../types/contracts";

export interface ChatListProps {
  chats: GroupDetailDto[];
  loading: boolean;
  error?: string;
  selectedId?: string;
  onSelectChat: (id: string) => void;
  onRetry: () => void;
}

/** Bandeja real ordenada por actividad, con búsqueda local y contadores persistidos. */
export function ChatList({
  chats,
  loading,
  error,
  selectedId,
  onSelectChat,
  onRetry,
}: ChatListProps) {
  const [search, setSearch] = useState("");
  const filtered = chats.filter((chat) =>
    chat.name.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es")),
  );
  return (
    <aside className="chat-sidebar" aria-label="Conversaciones">
      <div className="spec04-sidebar-title">
        <MessageCircle size={19} />
        <strong>Tus conversaciones</strong>
        <span className="count">{chats.length}</span>
      </div>
      <label className="search-input">
        <Search size={17} />
        <input
          aria-label="Buscar conversación"
          placeholder="Buscar un grupo…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <Notice error>{error}</Notice>
      {error && (
        <button className="text-button" onClick={onRetry}>
          Volver a intentar
        </button>
      )}
      <div className="chat-list">
        {loading ? (
          <Loading />
        ) : filtered.length ? (
          filtered.map((chat) => (
            <button
              key={chat.id}
              type="button"
              aria-current={chat.id === selectedId ? "page" : undefined}
              className={`chat-row ${chat.id === selectedId ? "active" : ""}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <span className="chat-icon">
                <Users size={20} />
              </span>
              <div className="spec04-chat-preview">
                <div className="chat-row-top">
                  <strong>{chat.name}</strong>
                  <time dateTime={chat.lastActivity}>
                    {new Date(chat.lastActivity).toLocaleDateString("es-PE", {
                      day: "numeric",
                      month: "short",
                    })}
                  </time>
                </div>
                <p>{chat.lastMessage || "Empieza una conversación."}</p>
              </div>
              {chat.unreadCount > 0 && (
                <span
                  className="badge"
                  aria-label={`${chat.unreadCount} sin leer`}
                >
                  {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                </span>
              )}
            </button>
          ))
        ) : (
          <div className="empty">
            <Users size={30} />
            <h3>
              {search ? "Sin coincidencias" : "Aquí empieza tu comunidad"}
            </h3>
            <p>
              {search
                ? "Prueba con otro nombre."
                : "Únete a un grupo para conversar con sus integrantes."}
            </p>
            <Link className="text-button" to="/grupos">
              Explorar grupos
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
