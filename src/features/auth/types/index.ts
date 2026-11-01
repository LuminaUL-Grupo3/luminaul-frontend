import { User } from "../../../types/common";

export type { User };
export * from "./auth.contracts";

// Contrato de useSession(): Layout, rutas y otros features dependen de user, loading,
// setUser y logout, por eso se conservan junto a lo que pide SPEC-01
export interface Session {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (u: User | null) => void;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
}

export type AuthMode = "login" | "register" | "verify" | "recover" | "reset";
