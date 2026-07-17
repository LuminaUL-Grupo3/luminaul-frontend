import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { UserMenu } from './UserMenu';
import { LogoutModal } from './LogoutModal';
import { Toast } from './Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export function Navbar() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setToast({
      show: true,
      message: 'Sesión cerrada correctamente',
      type: 'success',
    });
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav className="h-16 bg-white border-b border-border flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">L</span>
          </div>
          <span className="text-xl font-semibold text-foreground">LuminaUL</span>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cursos, grupos, publicaciones..."
              className="w-full h-10 pl-10 pr-4 bg-secondary rounded-lg border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors relative">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          <UserMenu onLogoutClick={handleLogoutClick} />
        </div>
      </nav>

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
}

