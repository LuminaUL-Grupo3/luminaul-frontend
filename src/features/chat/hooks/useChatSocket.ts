import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth";
import { chatCommand, getChatSocket } from "../services/socketClient";
import { groupKeys } from "./useGroupQueries";
import type {
  ChatError,
  GroupMessageDto,
  GroupDetailDto,
  HiddenEvent,
  PresenceEvent,
  ReactionEmoji,
  ReadEvent,
  RevokedEvent,
  SendMessageRequest,
  TypingEvent,
} from "../types/contracts";

/** Conserva los eventos por separado del historial para no perderlos si una respuesta REST llega tarde. */
export function useChatSocket(groupId: string, enabled: boolean) {
  const { user } = useSession(),
    cache = useQueryClient();
  const [joined, setJoined] = useState(false),
    [error, setError] = useState(""),
    [revoked, setRevoked] = useState(false);
  const [live, setLive] = useState<Record<string, GroupMessageDto>>({}),
    [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [onlineIds, setOnlineIds] = useState<string[]>([]),
    [typing, setTyping] = useState<Record<string, string>>({});
  const [reads, setReads] = useState<Record<string, ReadEvent>>({});
  const typingAt = useRef(0),
    typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const generation = useRef(0);
  const currentRoom = useRef("");
  const inboxRefresh = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  /** Agrupa las consultas de contadores después de una ráfaga; PostgreSQL conserva la verdad de lectura. */
  const refreshInbox = useCallback(() => {
    if (inboxRefresh.current) clearTimeout(inboxRefresh.current);
    inboxRefresh.current = setTimeout(() => {
      void cache.invalidateQueries({
        queryKey: groupKeys.mine(user?.id || ""),
      });
    }, 250);
  }, [cache, user?.id]);

  useEffect(
    () => () => {
      if (inboxRefresh.current) clearTimeout(inboxRefresh.current);
    },
    [user?.id],
  );

  /** Proyecta la actividad confirmada en la bandeja sin una petición HTTP por cada mensaje. */
  const updateInbox = useCallback(
    (message: GroupMessageDto) => {
      cache.setQueryData<GroupDetailDto[]>(
        groupKeys.mine(user?.id || ""),
        (previous) =>
          previous
            ?.map((group) =>
              group.id === message.groupId &&
              message.createdAt >= group.lastActivity
                ? {
                    ...group,
                    lastMessage:
                      message.status === "published"
                        ? message.content
                        : "Mensaje no disponible",
                    lastActivity: message.createdAt,
                  }
                : group,
            )
            .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity)),
      );
    },
    [cache, user?.id],
  );

  useEffect(() => {
    setLive({});
    setHiddenIds(new Set());
    setReads({});
    setError("");
    setRevoked(false);
    setJoined(false);
    setOnlineIds([]);
    setTyping({});
    const version = ++generation.current;
    currentRoom.current = enabled ? groupId : "";
    if (!groupId || !enabled || !user) return;
    let active = true;
    const socket = getChatSocket();
    /** Refresca únicamente el grupo actual y la bandeja después de una reconexión o cambio de membresía. */
    function invalidateGroups() {
      void cache.invalidateQueries({ queryKey: groupKeys.mine(user!.id) });
      void cache.invalidateQueries({
        queryKey: groupKeys.detail(user!.id, groupId),
      });
    }
    /** Reabre la sala antes de habilitar el envío y recupera lo ocurrido durante la desconexión. */
    async function join() {
      try {
        const ack = await chatCommand<{ groupId: string; userIds: string[] }>(
          "chat:join_room",
          { groupId },
        );
        if (!active) {
          if (currentRoom.current !== groupId || generation.current === version)
            void chatCommand("chat:leave_room", { groupId }).catch(() => {});
          return;
        }
        setJoined(true);
        setRevoked(false);
        setError("");
        setOnlineIds(ack.userIds);
        void cache.invalidateQueries({
          queryKey: groupKeys.messages(user!.id, groupId),
        });
        invalidateGroups();
      } catch (cause) {
        if (active) {
          setJoined(false);
          setError((cause as Error).message);
        }
      }
    }
    /** Aplica cada ID una sola vez, incluso si se recibe primero por ACK y después por REST. */
    function message(value: GroupMessageDto) {
      if (value.groupId !== groupId) return;
      setLive((previous) => ({ ...previous, [value.id]: value }));
      updateInbox(value);
      refreshInbox();
    }
    /** Al ocultar contenido también se elimina el texto de las respuestas citadas al renderizar. */
    function hidden(event: HiddenEvent) {
      if (event.groupId === groupId)
        setHiddenIds((previous) => new Set([...previous, event.messageId]));
    }
    /** Una decisión persistida del administrador reemplaza el estado anterior, incluso al restaurar. */
    function updated(value: GroupMessageDto) {
      if (value.groupId !== groupId) return;
      setHiddenIds((previous) => {
        const next = new Set(previous);
        next.delete(value.id);
        return next;
      });
      message(value);
    }
    /** Mantiene presencia de usuarios únicos, no un contador engañoso de pestañas. */
    function presence(event: PresenceEvent) {
      if (event.groupId === groupId) setOnlineIds(event.userIds);
    }
    /** Omite el indicador del propio usuario y retira inmediatamente los que dejan de escribir. */
    function type(event: TypingEvent) {
      if (event.groupId !== groupId || event.userId === user!.id) return;
      setTyping((previous) => {
        const next = { ...previous };
        if (event.isTyping) next[event.userId] = event.name;
        else delete next[event.userId];
        return next;
      });
    }
    /** Conserva el último marcador recibido; la base ya garantiza que nunca retrocede. */
    function read(event: ReadEvent) {
      if (event.groupId === groupId)
        setReads((previous) => ({ ...previous, [event.userId]: event }));
    }
    /** Limpia inmediatamente el contenido cuando se pierde pertenencia, aunque permanezca en la ruta. */
    function membership(event: RevokedEvent) {
      if (event.groupId !== groupId || event.userId !== user!.id) return;
      setRevoked(true);
      setJoined(false);
      setLive({});
      setOnlineIds([]);
      setTyping({});
      cache.removeQueries({ queryKey: groupKeys.messages(user!.id, groupId) });
      cache.removeQueries({ queryKey: groupKeys.members(user!.id, groupId) });
      invalidateGroups();
      setError(
        "Ya no perteneces a este grupo. No puedes consultar ni enviar mensajes.",
      );
    }
    /** Informa desconexión sin borrar el borrador ni fingir un envío exitoso. */
    function disconnect() {
      setJoined(false);
      setOnlineIds([]);
      setTyping({});
    }
    /** Mantiene los errores de transporte dentro del diseño de la aplicación. */
    function connectionError(cause: Error) {
      setJoined(false);
      setError(cause.message || "No pudimos conectar el chat.");
    }
    /** Los errores del servidor no se convierten en alertas nativas del navegador. */
    function serverError(value: ChatError) {
      setError(value.message);
    }
    /** La moderación y las decisiones de grupos pueden solicitar recargar los metadatos. */
    function changed(event: { groupId: string }) {
      if (event.groupId === groupId) {
        invalidateGroups();
        void cache.invalidateQueries({
          queryKey: groupKeys.members(user!.id, groupId),
        });
      }
    }
    socket.on("connect", join);
    socket.on("disconnect", disconnect);
    socket.on("connect_error", connectionError);
    socket.on("chat:new_message", message);
    socket.on("chat:message_updated", updated);
    socket.on("chat:message_hidden", hidden);
    socket.on("chat:presence", presence);
    socket.on("chat:typing", type);
    socket.on("chat:read", read);
    socket.on("chat:membership_revoked", membership);
    socket.on("chat:group_changed", changed);
    socket.on("chat:error", serverError);
    if (socket.connected) void join();
    else socket.connect();
    return () => {
      active = false;
      if (typingTimer.current) clearTimeout(typingTimer.current);
      socket.off("connect", join);
      socket.off("disconnect", disconnect);
      socket.off("connect_error", connectionError);
      socket.off("chat:new_message", message);
      socket.off("chat:message_updated", updated);
      socket.off("chat:message_hidden", hidden);
      socket.off("chat:presence", presence);
      socket.off("chat:typing", type);
      socket.off("chat:read", read);
      socket.off("chat:membership_revoked", membership);
      socket.off("chat:group_changed", changed);
      socket.off("chat:error", serverError);
      // StrictMode puede volver a abrir la misma sala; no se envía un leave tardío que anule el nuevo join.
      queueMicrotask(() => {
        if (
          (generation.current === version || currentRoom.current !== groupId) &&
          socket.connected
        ) {
          void chatCommand("chat:typing", { groupId, isTyping: false }).catch(
            () => {},
          );
          void chatCommand("chat:leave_room", { groupId }).catch(() => {});
        }
      });
    };
  }, [groupId, enabled, user?.id, cache, updateInbox, refreshInbox]);

  /** Confirma el mensaje persistido y conserva la misma clave de intento si el ACK se pierde. */
  const send = useCallback(
    async (payload: SendMessageRequest) => {
      if (!joined || revoked)
        throw new Error("Espera a que la conversación vuelva a conectarse.");
      const version = generation.current;
      const result = await chatCommand<{ message: GroupMessageDto }>(
        "chat:send_message",
        payload,
      );
      // Un ACK de una sala anterior no debe incorporarse al historial de la nueva conversación.
      if (
        version !== generation.current ||
        currentRoom.current !== payload.groupId
      )
        return result.message;
      setLive((previous) => ({
        ...previous,
        [result.message.id]: result.message,
      }));
      setError("");
      updateInbox(result.message);
      return result.message;
    },
    [joined, revoked, updateInbox],
  );

  /** Limita los avisos de escritura y emite el cese también por inactividad local. */
  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      if (!joined) return;
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (!isTyping || Date.now() - typingAt.current > 1200) {
        typingAt.current = Date.now();
        void chatCommand("chat:typing", { groupId, isTyping }).catch(() => {});
      }
      if (isTyping)
        typingTimer.current = setTimeout(() => {
          void chatCommand("chat:typing", { groupId, isTyping: false }).catch(
            () => {},
          );
        }, 2200);
    },
    [groupId, joined],
  );

  /** Cambia reacciones con el agregado confirmado por PostgreSQL. */
  const react = useCallback(
    async (messageId: string, emoji: ReactionEmoji, add: boolean) => {
      const version = generation.current;
      const result = await chatCommand<{ message: GroupMessageDto }>(
        add ? "reaction:add" : "reaction:remove",
        { groupId, messageId, emoji },
      );
      if (version !== generation.current || currentRoom.current !== groupId)
        return;
      setLive((previous) => ({ ...previous, [messageId]: result.message }));
    },
    [groupId],
  );

  /** El componente llama esto solo cuando el final de la conversación es visible y la ventana tiene foco. */
  const markRead = useCallback(
    async (messageId: string) => {
      if (!joined || revoked) return;
      const version = generation.current;
      await chatCommand("message:read", { groupId, messageId });
      if (version !== generation.current || currentRoom.current !== groupId)
        return;
      // No pone el contador a cero a ciegas: otro mensaje podría llegar antes de recibir este ACK.
      refreshInbox();
    },
    [groupId, joined, revoked, refreshInbox],
  );

  return {
    joined,
    error,
    revoked,
    live,
    hiddenIds,
    reads,
    onlineIds,
    typingNames: Object.values(typing),
    send,
    notifyTyping,
    react,
    markRead,
  };
}
