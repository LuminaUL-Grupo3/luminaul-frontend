import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
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
  ArrowUpRight,
} from "lucide-react";
import { SessionProvider, useSession } from "./session";
import { AuthPage } from "./auth-pages";
import { FeedPage, PostEditor } from "./publication-pages";
import { GroupsPage, GroupPage, RequestsPage } from "./group-pages";
import { ChatPage } from "./chat-page";
import {
  ProfilePage,
  EditProfilePage,
  AvailabilityPage,
  MyReviewsPage,
  SettingsPage,
} from "./profile-pages";
import {
  ModerationPage,
  NotificationsPage,
  AdminPage,
} from "./moderation-pages";
import { Avatar, Loading, Notice } from "./ui";
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
function Layout() {
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
          <button onClick={() => logout().catch((e) => setError(e.message))}>
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
function AdminRoute() {
  const { user } = useSession();
  return user?.role === "admin" ? <AdminPage /> : <Navigate to="/" replace />;
}
function UnknownPage() {
  return (
    <div className="empty">
      <h1>Esta página no existe.</h1>
      <Link className="button" to="/">
        Volver al inicio <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/registro"
            element={<AuthPage key="register" mode="register" />}
          />
          <Route
            path="/verificar"
            element={<AuthPage key="verify" mode="verify" />}
          />
          <Route
            path="/recuperar"
            element={<AuthPage key="recover" mode="recover" />}
          />
          <Route
            path="/restablecer"
            element={<AuthPage key="reset" mode="reset" />}
          />
          <Route element={<Layout />}>
            <Route index element={<FeedPage />} />
            <Route path="buscar" element={<FeedPage search />} />
            <Route path="mis-publicaciones" element={<FeedPage mine />} />
            <Route path="publicar" element={<PostEditor />} />
            <Route path="publicar/:id" element={<PostEditor />} />
            <Route path="grupos" element={<GroupsPage />} />
            <Route path="grupos/:id" element={<GroupPage />} />
            <Route path="solicitudes" element={<RequestsPage />} />
            <Route path="mensajes" element={<ChatPage />} />
            <Route path="mensajes/:id" element={<ChatPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="perfil/editar" element={<EditProfilePage />} />
            <Route path="perfil/:id" element={<ProfilePage />} />
            <Route path="horario" element={<AvailabilityPage />} />
            <Route path="mis-resenas" element={<MyReviewsPage />} />
            <Route path="moderacion" element={<ModerationPage />} />
            <Route path="notificaciones" element={<NotificationsPage />} />
            <Route path="configuracion" element={<SettingsPage />} />
            <Route path="admin" element={<AdminRoute />} />
            <Route path="*" element={<UnknownPage />} />
          </Route>
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
