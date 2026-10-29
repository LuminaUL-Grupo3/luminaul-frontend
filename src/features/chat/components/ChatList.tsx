import { useState } from "react";
import { Search, Users } from "lucide-react";
import { date } from "@/config/api";
import { Loading, Empty } from "@/components/ui";
import { Chat } from "../types";

export interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  selectedId?: string;
  onSelectChat: (id: string) => void;
}

export function ChatList({
  chats,
  loading,
  selectedId,
  onSelectChat,
}: ChatListProps) {
  const [search, setSearch] = useState("");

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="chat-sidebar">
      <label className="search-input">
        <Search size={18} />
        <input
          placeholder="Buscar un grupo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="chat-list">
        {loading ? (
          <Loading />
        ) : filteredChats.length ? (
          filteredChats.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectChat(c.id)}
              className={`chat-row ${c.id === selectedId ? "active" : ""}`}
            >
              <span className="chat-icon">
                <Users size={18} />
              </span>
              <div>
                <div className="chat-row-top">
                  <strong>{c.name}</strong>
                  <span className="small-label">{date(c.last_activity)}</span>
                </div>
                <p>{c.last_message || "Aún no hay mensajes compartidos."}</p>
              </div>
              {c.unread > 0 && <span className="badge">{c.unread}</span>}
            </button>
          ))
        ) : (
          <Empty title="Sin conversaciones">
            Únete a un grupo para empezar a conversar.
          </Empty>
        )}
      </div>
    </aside>
  );
}
