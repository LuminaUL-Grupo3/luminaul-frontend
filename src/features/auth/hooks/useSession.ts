import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { authService } from "../services/authService";
import { Session } from "../types";

// Borra todo rastro de la sesión en el cliente: caché de TanStack Query y store
export function useClearSession() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.clear();
    useAuthStore.getState().clear();
  }, [queryClient]);
}

// Facade sobre useAuthStore. Al quedar sin usuario, Layout redirige a /login.
export function useSession(): Session {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useClearSession();

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return {
    user,
    token,
    loading: status === "checking",
    isAuthenticated: user !== null,
    isAdmin: user?.role === "admin",
    setUser,
    login: setSession,
    logout,
  };
}
