import { io, Socket } from "socket.io-client";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { ChatCommand, WsAck } from "../types/contracts";

let client: Socket | undefined;
let unsubscribeSession: (() => void) | undefined;

/** Comparte la conexión; una navegación abandona su sala sin desconectar el cliente global. */
export function getChatSocket(): Socket {
  if (!client) {
    const origin = new URL(env.API_URL || "/", window.location.origin).origin;
    client = io(origin, {
      path: "/socket.io",
      autoConnect: false,
      withCredentials: true,
      auth: (callback) => {
        const token = useAuthStore.getState().token;
        callback(token ? { token } : {});
      },
    });
    unsubscribeSession = useAuthStore.subscribe((state, previous) => {
      if (state.user?.id !== previous.user?.id || !state.user)
        client?.disconnect();
    });
  }
  return client;
}

/** Exige confirmación y no acumula envíos invisibles cuando la conexión está caída. */
export async function chatCommand<T extends object>(
  event: ChatCommand,
  payload: object,
): Promise<T> {
  const socket = getChatSocket();
  if (!socket.connected)
    throw new Error(
      "Sin conexión. Conservamos tu mensaje para que puedas reintentarlo.",
    );
  let response: unknown;
  try {
    response = await socket.timeout(8000).emitWithAck(event, payload);
  } catch {
    throw new Error(
      "No llegó la confirmación. Puedes reintentar el mismo mensaje sin duplicarlo.",
    );
  }
  const ack = response as WsAck<T> | undefined;
  if (!ack || typeof ack.success !== "boolean")
    throw new Error("El servidor no confirmó la acción. Inténtalo de nuevo.");
  if (!ack.success) throw new Error(ack.error.message);
  return ack;
}

/** Libera recursos cuando Vite reemplaza este módulo durante desarrollo. */
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    unsubscribeSession?.();
    client?.disconnect();
    client = undefined;
  });
