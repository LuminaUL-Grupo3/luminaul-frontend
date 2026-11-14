import { io, Socket } from "socket.io-client";
import { env } from "./env";

/**
 * Fábrica compartida de conexiones Socket.IO por namespace.
 * Mantiene el transporte HTTP único `/socket.io` sin acoplar features entre sí.
 */
export function createAppSocket(
  namespace: string,
  getToken: () => string | null | undefined,
): Socket {
  const origin = new URL(env.API_URL || "/", window.location.origin).origin;
  const suffix = namespace
    ? namespace.startsWith("/")
      ? namespace
      : `/${namespace}`
    : "";
  return io(`${origin}${suffix}`, {
    path: "/socket.io",
    autoConnect: false,
    withCredentials: true,
    auth: (callback) => {
      const token = getToken();
      callback(token ? { token } : {});
    },
  });
}

