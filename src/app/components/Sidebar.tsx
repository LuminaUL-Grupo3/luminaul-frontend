import { Home, FileText, Users, User } from 'lucide-react';

export function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Inicio', active: false },
    { icon: FileText, label: 'Publicaciones', active: true },
    { icon: Users, label: 'Grupos de Estudio', active: false },
    { icon: User, label: 'Perfil', active: false },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border fixed left-0 top-16 bottom-0 p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
