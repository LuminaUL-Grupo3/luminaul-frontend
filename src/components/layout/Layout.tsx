import { useState, useEffect, Suspense } from "react";
import {
  NavLink,
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
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
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useSession } from "../../features/auth/hooks/useSession";
// Import directo del hook: el index de profile arrastraría sus páginas, que se cargan con lazy
import { useMyProfileQuery } from "../../features/profile/hooks/useProfileQueries";
import { Avatar, Loading, Notice } from "../ui";
import { Brand } from "../brand/Brand";
import { useFeedback } from "../../hooks/useFeedback";
import { NotificationsBell } from "../../features/admin/components/NotificationsBell";

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

const secondarySections: Record<string, string> = {
  "/publicar": "Crear publicación",
  "/configuracion": "Configuración",
  "/admin": "Administración",
};

export function Layout() {
  const feedback = useFeedback(),
    navigate = useNavigate();
  const { user, loading, logout } = useSession(),
    [open, setOpen] = useState(false),
    [error, setError] = useState(""),
    location = useLocation(),
    // SPEC-02: la foto del perfil se refleja en la barra superior en cuanto se edita
    myProfile = useMyProfileQuery(Boolean(user));

  useEffect(() => setOpen(false), [location.pathname]);

  // El encabezado indica la sección actual sin agregar rutas ni modificar permisos.
  const activeSection = [...nav, ...personal].find(([path]) =>
    path === "/"
      ? location.pathname === path
      : location.pathname.startsWith(path),
  );
  const section =
    activeSection?.[1] ??
    secondarySections[location.pathname] ??
    "Mi comunidad";
  const personalSection =
    personal.some(([path]) => location.pathname.startsWith(path)) ||
    location.pathname.startsWith("/configuracion");
  const sectionGroup = personalSection
    ? "Mi espacio"
    : location.pathname.startsWith("/admin")
      ? "Administración"
      : "Comunidad";
  const SectionIcon = activeSection?.[2] ?? Settings;

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div
      className="app-shell"
      data-section={location.pathname.split("/")[1] || "inicio"}
    >
      <a className="skip-link" href="#main-content">
        Ir al contenido
      </a>
      <header className="topbar">
        <button
          className="icon-button mobile-menu"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="community-navigation"
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </button>
        <Link className="app-brand" to="/" aria-label="LuminaUL, mi comunidad">
          <Brand compact />
        </Link>
        <div className="topbar-center">
          <span>{sectionGroup}</span>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="section-symbol">
            <SectionIcon size={15} aria-hidden="true" />
          </span>
          <strong>{section}</strong>
        </div>
        <div className="topbar-right">
          {/* SPEC-07: campana con el contador de notificaciones sin leer */}
          <NotificationsBell />
          <div className="topbar-divider" />
          <Link className="person" to="/perfil">
            <Avatar
              name={user.name}
              src={myProfile.data?.profilePhotoUrl || undefined}
            />
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
      <aside
        id="community-navigation"
        className={`sidebar ${open ? "open" : ""}`}
      >
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
        <nav aria-label="Comunidad">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-heading">MI ESPACIO</div>
        <nav aria-label="Mi espacio">
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
          <button
            onClick={async () => {
              if (
                !(await feedback.confirm({
                  title: "¿Cerrar tu sesión?",
                  description:
                    "Tus grupos y conversaciones seguirán aquí cuando vuelvas. Podrás ingresar nuevamente con tu correo institucional.",
                  acceptLabel: "Cerrar sesión",
                  cancelLabel: "Seguir en mi comunidad",
                }))
              )
                return;
              try {
                await logout();
                navigate("/", { replace: true });
              } catch (e: unknown) {
                setError((e as Error).message);
              }
            }}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
          <span>LuminaUL · Ingeniería de Software II</span>
        </div>
      </aside>
      <main className="main-content" id="main-content">
        <Notice error>{error}</Notice>
        {/* Otra sala conserva el contenedor del chat; la entrada anima únicamente otra sección. */}
        <div
          className="workspace-view"
          key={location.pathname.split("/")[1] || "inicio"}
        >
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
