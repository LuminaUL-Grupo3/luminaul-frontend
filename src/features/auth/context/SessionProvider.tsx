import { ReactNode, useContext, useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";

// Restaura la sesión al cargar la app y la limpia cuando el backend responde 401
function SessionBootstrap({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then((user) => !cancelled && useAuthStore.getState().setUser(user))
      .catch(() => !cancelled && useAuthStore.getState().clear());

    // config/api.ts emite este evento ante un 401 fuera de /auth/*
    const expired = () => {
      queryClient.clear();
      useAuthStore.getState().clear();
    };
    window.addEventListener("session-expired", expired);
    return () => {
      cancelled = true;
      window.removeEventListener("session-expired", expired);
    };
  }, [queryClient]);

  return <>{children}</>;
}

// app.tsx ya envuelve la app con SessionProvider; si el integrador todavía no registró un
// QueryClientProvider, se crea uno aquí para que funcionen los useMutation de este feature
export function SessionProvider({ children }: { children: ReactNode }) {
  const existingClient = useContext(QueryClientContext);
  const [fallbackClient] = useState(() =>
    existingClient ? null : new QueryClient({ defaultOptions: { mutations: { retry: false } } }),
  );

  const content = <SessionBootstrap>{children}</SessionBootstrap>;
  return fallbackClient ? (
    <QueryClientProvider client={fallbackClient}>{content}</QueryClientProvider>
  ) : (
    content
  );
}
