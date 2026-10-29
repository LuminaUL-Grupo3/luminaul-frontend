import { useState, useEffect } from "react";
import {
  NavLink,
  Link,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import {
  Sun,
  House,
  Search,
  Users,
  MessageCircle,
  Inbox,
  FileText,
  UserRound,
  Calendar,
  Star,
  Shield,
  Bell,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { useSession } from "../../features/auth/hooks/useSession";
import { Avatar, Loading, Notice } from "../ui";

const nav = [
  ["/", "Inicio", House],
  ["/buscar", "Explorar", Search],
  ["/grupos", "Mis grupos", Users],
  ["/mensajes", "Mensajes", MessageCircle],
  ["/solicitudes", "Solicitudes", Inbox],
] as const;

const personal = [
  ["/mis-publicaciones", "Mis publicaciones", FileText],
  ["/perfil", "Mi perfil", UserRound],
  ["/horario", "Disponibilidad", Calendar],
  ["/mis-resenas", "Mis reseñas", Star],
  ["/moderacion", "Moderación", Shield],
] as const;

export function Layout() {
  const { user, loading, logout } = useSession(),
    [open, setOpen] = useState(false),
    [error, setError] = useState(""),
    location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Ir al contenido
      </a>
      <header className="topbar">
        <button
          className="icon-button mobile-menu"
          aria-label="Abrir menú"
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </button>
        <Link className="brand" to="/">
          <span className="brand-icon">
            <Sun size={24} />
          </span>
          Lumina<span>UL</span>
        </Link>
        <div className="topbar-center">
          <span className="live-dot" />
          Un espacio para aprender juntos
        </div>
        <div className="topbar-right">
          <Link
            className="icon-button"
            title="Notificaciones"
            to="/notificaciones"
          >
            <Bell size={21} />
          </Link>
          <div className="topbar-divider" />
          <Link className="person" to="/perfil">
            <Avatar name={user.name} />
            <span className="topbar-name">
              {user.name.split(" ")[0]}
              <small>
                {user.role === "admin" ? "Administración" : "Estudiante"}
              </small>
            </span>
          </Link>
        </div>
      </header>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-heading">
          COMUNIDAD
          <button
            className="icon-button mobile-menu"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <nav>
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-heading">MI ESPACIO</div>
        <nav>
          {personal.map(([to, label, Icon]) => (
            <NavLink key={to} to={to}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
          {user.role === "admin" && (
            <NavLink to="/admin">
              <Shield size={19} />
              Administración
            </NavLink>
          )}
        </nav>
        <Link className="button full sidebar-create" to="/publicar">
          <Plus size={18} />
          Crear publicación
        </Link>
        <div className="sidebar-bottom">
          <Link to="/configuracion">
            <Settings size={18} />
            Configuración
          </Link>
          <button onClick={() => logout().catch((e: unknown) => setError((e as Error).message))}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
          <span>LuminaUL · Ingeniería de Software II</span>
        </div>
      </aside>
      <main className="main-content" id="main-content">
        <Notice error>{error}</Notice>
        <Outlet />
      </main>
    </div>
  );
}
