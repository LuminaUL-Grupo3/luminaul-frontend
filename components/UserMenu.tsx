import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';

interface UserMenuProps {
  onLogoutClick: () => void;
}

export function UserMenu({ onLogoutClick }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuItemClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogoutClick();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-secondary transition-colors"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <ChevronDown className={`w-4 h-4 text-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-56 bg-white rounded-lg border border-border shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-medium text-foreground">Usuario</p>
            <p className="text-sm text-muted-foreground">estudiante@aloe.ulima.edu.pe</p>
          </div>

          <div className="py-2">
            <button
              onClick={() => handleMenuItemClick('/perfil')}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors text-left"
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Mi Perfil</span>
            </button>

            <button
              onClick={() => handleMenuItemClick('/configuracion')}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Configuración</span>
            </button>
          </div>

          <div className="border-t border-border pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-left group"
            >
              <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
              <span className="text-foreground group-hover:text-destructive">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
