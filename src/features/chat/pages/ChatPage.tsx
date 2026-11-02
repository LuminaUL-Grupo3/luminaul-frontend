import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "@/features/auth";
import { PageHeader, Notice } from "@/components/ui";
import {
  useMyGroupsQuery,
  useGroupDetailQuery,
  useChatMessagesQuery,
} from "../hooks/useGroupQueries";
import { useChatSocket } from "../hooks/useChatSocket";
import { ChatList } from "../components/ChatList";
import { ChatWindow } from "../components/ChatWindow";
import type { GroupMessageDto } from "../types/contracts";
import "../styles/chat.css";

/** Une el historial REST con eventos reales sin duplicar ACKs ni resucitar contenido moderado. */
export function ChatPage() {
  const { id = "" } = useParams(),
    navigate = useNavigate(),
    { user } = useSession();
  const groups = useMyGroupsQuery(),
    detail = useGroupDetailQuery(id);
  const enabled = detail.data?.myStatus === "active";
  const socket = useChatSocket(id, enabled),
    history = useChatMessagesQuery(id, enabled && !socket.revoked);
  const messages = useMemo(() => {
    if (socket.revoked) return [];
    const map = new Map<string, GroupMessageDto>();
    for (const message of history.data?.pages.flat() || [])
      map.set(message.id, message);
    for (const message of Object.values(socket.live))
      map.set(message.id, message);
    const ordered = [...map.values()].sort(
      (a, b) =>
        a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
    );
    const indexes = new Map(
      ordered.map((message, index) => [message.id, index]),
    );
    return ordered.map((message, index) => {
      const hidden = socket.hiddenIds.has(message.id);
      const readBy = new Map(
        message.readBy.map((reader) => [reader.userId, reader]),
      );
      for (const reader of Object.values(socket.reads))
        if (
          reader.userId !== message.senderId &&
          (indexes.get(reader.messageId) ?? -1) >= index
        )
          readBy.set(reader.userId, {
            userId: reader.userId,
            name: reader.name,
          });
      return {
        ...message,
        content: hidden ? "" : message.content,
        status: hidden ? ("hidden" as const) : message.status,
        replyTo:
          message.replyTo && socket.hiddenIds.has(message.replyTo.id)
            ? { ...message.replyTo, content: null, status: "hidden" as const }
            : message.replyTo,
        readBy: [...readBy.values()],
      };
    });
  }, [
    history.data,
    socket.live,
    socket.hiddenIds,
    socket.reads,
    socket.revoked,
  ]);

  return (
    <div className="spec04">
      <PageHeader
        eyebrow="COMUNICACIÓN EN TIEMPO REAL"
        title="Mensajes"
        description="Un espacio para conversar, aprender y avanzar en grupo."
      />
      <div className={`chat-layout ${id ? "has-conversation" : ""}`}>
        <ChatList
          chats={groups.data || []}
          loading={groups.isPending}
          error={groups.error?.message}
          selectedId={id}
          onSelectChat={(groupId) => navigate(`/mensajes/${groupId}`)}
          onRetry={() => void groups.refetch()}
        />
        {id && (detail.isError || (!detail.isPending && !enabled)) ? (
          <section className="chat-main">
            <Notice error>
              {detail.error?.message ||
                "Necesitas pertenecer a este grupo para acceder a su conversación."}
            </Notice>
            <button
              className="button secondary"
              onClick={() => navigate(`/grupos/${id}`)}
            >
              Ver grupo
            </button>
          </section>
        ) : (
          <ChatWindow
            key={id}
            group={detail.data}
            groupId={id}
            userId={user?.id || ""}
            connected={socket.joined}
            revoked={socket.revoked}
            messages={messages}
            loading={Boolean(id) && (detail.isPending || history.isPending)}
            more={Boolean(history.hasNextPage)}
            loadingMore={history.isFetchingNextPage}
            error={socket.error || history.error?.message}
            onlineIds={socket.onlineIds}
            typingNames={socket.typingNames}
            onLoadMore={async () => {
              await history.fetchNextPage();
            }}
            onSendMessage={socket.send}
            onTyping={socket.notifyTyping}
            onReaction={socket.react}
            onRead={socket.markRead}
          />
        )}
      </div>
    </div>
  );
}
