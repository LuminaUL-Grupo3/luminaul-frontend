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
      .catch((e) => {
        // En Modo Demo (Sprint actual según Acuerdo de Endpoints 3.2),
        // si /auth/me no está implementado en el backend (retorna 404),
        // se asume el usuario semilla demo documentado para interactuar con la plataforma.
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
