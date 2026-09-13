import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api, User } from "./api";
interface Session {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
}
const Context = createContext<Session>(null!);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .request<User>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    const expired = () => setUser(null);
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, []);
  async function logout() {
    try {
      await api.request("/auth/logout", "POST");
    } finally {
      setUser(null);
    }
  }
  return (
    <Context.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </Context.Provider>
  );
}
export const useSession = () => useContext(Context);
