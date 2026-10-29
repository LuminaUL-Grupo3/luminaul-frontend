import { User } from "../../../types/common";

export type { User };

export interface Session {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
}

export type AuthMode = "login" | "register" | "verify" | "recover" | "reset";
