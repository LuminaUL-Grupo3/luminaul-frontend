import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { api } from "@/config/api";
import { useSession } from "@/features/auth";
import { useResource } from "@/hooks/useResource";
import { PageHeader } from "@/components/ui";
import { Chat, Message } from "../types";
import { ChatList, ChatWindow } from "../components";

export function ChatPage() {
  const { id } = useParams(),
    navigate = useNavigate(),
    { user } = useSession();
  const chats = useResource<Chat[]>("/chats", []),
    [messages, setMessages] = useState<Message[]>([]),
    [error, setError] = useState(""),
    [connected, setConnected] = useState(false),
    [loading, setLoading] = useState(false),
    [more, setMore] = useState(false);
  const socket = useRef<Socket | null>(null),
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
    if (!id) return;
    history(id);
    const s = io({ path: "/socket.io", withCredentials: true });
    socket.current = s;
    s.on("connect", () => {
      setConnected(true);
      s.emit("join", id);
    });
    s.on("disconnect", () => setConnected(false));
    s.on("message", (m: Message) => {
      if (m.group_id === id) {
        setMessages((previous) =>
          [
            ...new Map([...previous, m].map((item) => [item.id, item])).values(),
          ].sort(
            (a, b) =>
              a.created_at.localeCompare(b.created_at) ||
              a.id.localeCompare(b.id),
          ),
        );
        api.request(`/groups/${id}/read`, "POST").catch(() => {});
      }
    });
    return () => {
      s.disconnect();
    };
  }, [id]);

  async function sendMessage(content: string) {
    if (!id) return;
    try {
      const sent = await api.request<Message>(
        `/groups/${id}/messages`,
        "POST",
        { content },
      );
      setMessages((previous) =>
        [
          ...new Map([...previous, sent].map((item) => [item.id, item])).values(),
        ].sort(
          (a, b) =>
            a.created_at.localeCompare(b.created_at) ||
            a.id.localeCompare(b.id),
        ),
      );
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  }

  const selected = chats.data.find((c) => c.id === id);

  return (
    <>
      <PageHeader
        eyebrow="COMUNICACIÓN EN TIEMPO REAL"
        title="Mensajes"
        description="Conversa con los integrantes de tus grupos de estudio."
      />
      <div className="chat-layout">
        <ChatList
          chats={chats.data}
          loading={chats.loading}
          selectedId={id}
          onSelectChat={(groupId) => navigate(`/mensajes/${groupId}`)}
        />
        <ChatWindow
          groupId={id}
          groupName={selected?.name}
          connected={connected}
          messages={messages}
          loading={loading}
          more={more}
          error={error}
          userId={user?.id}
          onLoadMore={() => id && history(id)}
          onSendMessage={sendMessage}
        />
      </div>
    </>
  );
}
