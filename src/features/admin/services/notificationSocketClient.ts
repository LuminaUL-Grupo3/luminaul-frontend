import { Socket } from "socket.io-client";
import { createAppSocket } from "@/config/socket";
import { useAuthStore } from "@/features/auth";

let client: Socket | undefined;
let unsubscribeSession: (() => void) | undefined;

/**
 * Conexión exclusiva para el namespace `/notifications` (SPEC-07),
 * desacoplada del cliente de chat (SPEC-04).
 */
export function getNotificationSocket(): Socket {
  if (!client) {
    client = createAppSocket(
      "/notifications",
      () => useAuthStore.getState().token,
    );
    unsubscribeSession = useAuthStore.subscribe((state, previous) => {
      if (state.user?.id !== previous.user?.id || !state.user)
        client?.disconnect();
    });
  }
  return client;
}

if (import.meta.hot)
  import.meta.hot.dispose(() => {
    unsubscribeSession?.();
    client?.disconnect();
    client = undefined;
  });

