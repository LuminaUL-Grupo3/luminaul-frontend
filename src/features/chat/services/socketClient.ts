import { Socket } from "socket.io-client";
import { createAppSocket } from "@/config/socket";
import { useAuthStore } from "@/features/auth";
import type { ChatCommand, WsAck } from "../types/contracts";

let client: Socket | undefined;
let unsubscribeSession: (() => void) | undefined;

/** Comparte la conexión; una navegación abandona su sala sin desconectar el cliente global. */
export function getChatSocket(): Socket {
  if (!client) {
    client = createAppSocket("", () => useAuthStore.getState().token);
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
