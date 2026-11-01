import { create } from "zustand";
import { User } from "../types";

type SessionStatus = "checking" | "authenticated" | "anonymous";

interface AuthState {
  user: User | null;
  // Solo en memoria (nunca en localStorage): al recargar, la cookie httpOnly y /auth/me
  // restauran al usuario, así el token no queda expuesto a scripts de terceros
  token: string | null;
  status: SessionStatus;
  setSession: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  status: "checking",
  setSession: (user, token) => set({ user, token, status: "authenticated" }),
  setUser: (user) =>
    set((state) => ({
      user,
      token: user ? state.token : null,
      status: user ? "authenticated" : "anonymous",
    })),
  clear: () => set({ user: null, token: null, status: "anonymous" }),
}));
