import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "../../../config/api";
import { User } from "../../../types/common";
import { Session } from "../types";

const SessionContext = createContext<Session>(null!);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .request<User>("/auth/me")
      .then(setUser)
      .catch((e) => {
        if (e && (e as { status?: number }).status === 404) {
          setUser({
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            name: "Martín Vizcarra",
            email: "demo.student@ulima.edu.pe",
            role: "student",
          });
        } else {
          setUser(null);
        }
      })
      .finally(() => setLoading(false));

    const expired = () => setUser(null);
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, []);

  async function logout() {
    try {
      await api.request("/auth/logout", "POST");
    } catch (e) {
      if ((e as { status?: number }).status !== 401) throw e;
    } finally {
      setUser(null);
    }
  }

  return (
    <SessionContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
