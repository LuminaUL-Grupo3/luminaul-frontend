import {
  Home,
  Plus,
  FileText,
  Search,
  Users,
  UserCheck,
  MessageSquare,
  Bot,
  ShieldCheck,
  Flag,
  UserCircle,
} from 'lucide-react';
import { Link, useLocation } from 'react-router';

const MAIN_ITEMS = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: Search, label: 'Buscar', path: '/buscar' },
  { icon: Users, label: 'Grupos', path: '/grupos' },
  { icon: MessageSquare, label: 'Mensajes', path: '/mensajes' },
  { icon: UserCheck, label: 'Solicitudes', path: '/solicitudes' },
  { icon: Plus, label: 'Crear publicación', path: '/crear' },
  { icon: FileText, label: 'Mis publicaciones', path: '/mis-publicaciones' },
  { icon: UserCircle, label: 'Mi perfil', path: '/perfil' },
];

const ADMIN_ITEMS = [
  { icon: Bot, label: 'Panel de moderación', path: '/admin/moderacion' },
  { icon: Flag, label: 'Reportes', path: '/admin/reportes' },
  { icon: ShieldCheck, label: 'Apelaciones', path: '/admin/apelaciones' },
  { icon: ShieldCheck, label: 'Historial de apelaciones', path: '/admin/historial-apelaciones' },
];

export function AppSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const location = useLocation();

  const NavLink = ({
    icon: Icon,
    label,
    path,
  }: {
    icon: React.ElementType;
    label: string;
    path: string;
  }) => {
    const isActive =
      location.pathname === path ||
      (location.pathname.startsWith(path + '/') && path !== '/');

    return (
      <Link
        to={path}
        onClick={onClose}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm leading-tight">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop: solo móvil, cuando el drawer está abierto */}
      {isOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 bg-sidebar border-r border-sidebar-border fixed left-0 top-16 bottom-0 p-4 flex flex-col overflow-y-auto z-40 transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <nav className="space-y-1 flex-1">
        {MAIN_ITEMS.map((item) => (
          <NavLink key={item.path} {...item} />
        ))}

        <div className="pt-4 pb-1 px-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Administración
          </p>
        </div>

        {ADMIN_ITEMS.map((item) => (
          <NavLink key={item.path} {...item} />
        ))}
      </nav>
      </aside>
    </>
  );
}