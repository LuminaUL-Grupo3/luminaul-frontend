import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, GraduationCap, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { DeleteAccountModal } from '../components/DeleteAccountModal';

export function AccountSettingsPage() {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const userInfo = {
    name: 'Nombre del Estudiante',
    email: 'estudiante@aloe.ulima.edu.pe',
    career: 'Ingeniería de Sistemas',
    code: '20221234',
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-white rounded-xl border border-border p-8 max-w-md w-full text-center animate-in zoom-in-95">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl mb-2">Cuenta eliminada correctamente</h2>
          <p className="text-muted-foreground">
            Tu cuenta y toda tu información han sido eliminadas. Redirigiendo al inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Configuración de cuenta</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y preferencias de seguridad</p>
      </div>

      {/* Información del usuario */}
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Información personal</h2>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-6 mb-6">
            {/* Foto de perfil */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <button className="mt-3 text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                Cambiar foto
              </button>
            </div>

            {/* Información */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Nombre completo
                </label>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{userInfo.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Correo institucional
                </label>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{userInfo.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Carrera
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{userInfo.career}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Código
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{userInfo.code}</span>
                  </div>
                </div>
              </div>

              <button className="h-10 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                Editar información
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Seguridad</h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <h3 className="font-medium mb-1">Contraseña</h3>
                <p className="text-sm text-muted-foreground">
                  Última actualización hace 30 días
                </p>
              </div>
              <button className="h-10 px-6 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium">
                Cambiar contraseña
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <h3 className="font-medium mb-1">Verificación en dos pasos</h3>
                <p className="text-sm text-muted-foreground">
                  Agrega una capa adicional de seguridad
                </p>
              </div>
              <button className="h-10 px-6 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                Activar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zona de peligro */}
      <div className="bg-white rounded-xl border-2 border-red-200 overflow-hidden">
        <div className="p-6 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">Zona de peligro</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Eliminar cuenta</h3>
              <p className="text-muted-foreground mb-4">
                Esta acción es permanente y eliminará toda tu información y actividad en la plataforma.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Se eliminarán todos tus datos personales</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Perderás acceso a todos los grupos</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Se borrarán todas tus publicaciones</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Esta acción no se puede deshacer</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleDeleteAccount}
              className="h-11 px-6 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium flex items-center gap-2 flex-shrink-0"
            >
              <AlertTriangle className="w-5 h-5" />
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-3">Información importante:</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span>•</span>
            <span>Si eliminas tu cuenta, no podrás volver a usar el mismo correo institucional</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Tienes 30 días para recuperar tu cuenta antes de que se elimine permanentemente</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Puedes exportar tus datos antes de eliminar tu cuenta</span>
          </li>
        </ul>
      </div>

      {/* Modal de confirmación */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
