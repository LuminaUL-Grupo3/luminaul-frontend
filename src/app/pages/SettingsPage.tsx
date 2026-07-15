import { useNavigate } from 'react-router';
import { Bell, Lock, Globe, Moon, User, ArrowRight } from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia en LuminaUL</p>
      </div>

      {/* Configuración de cuenta */}
      <button
        onClick={() => navigate('/configuracion/cuenta')}
        className="w-full bg-white rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all mb-6 text-left group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                Configuración de cuenta
              </h3>
              <p className="text-sm text-muted-foreground">
                Gestiona tu información personal y seguridad
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </button>

      <div className="space-y-6">
        {/* Notificaciones */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Notificaciones</h3>
              <p className="text-sm text-muted-foreground">Gestiona cómo recibes actualizaciones</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-foreground">Notificaciones por email</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary accent-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-foreground">Notificaciones push</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary accent-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-foreground">Nuevas solicitudes de grupo</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary accent-primary" />
            </label>
          </div>
        </div>

        {/* Privacidad */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Privacidad y Seguridad</h3>
              <p className="text-sm text-muted-foreground">Controla quién puede ver tu información</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-foreground">Perfil público</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary accent-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-foreground">Mostrar grupos en perfil</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary accent-primary" />
            </label>
          </div>
        </div>

        {/* Apariencia */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Moon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Apariencia</h3>
              <p className="text-sm text-muted-foreground">Personaliza cómo se ve la aplicación</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Tema</label>
              <select className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none">
                <option>Claro</option>
                <option>Oscuro</option>
                <option>Automático</option>
              </select>
            </div>
          </div>
        </div>

        {/* Idioma */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Idioma</h3>
              <p className="text-sm text-muted-foreground">Selecciona tu idioma preferido</p>
            </div>
          </div>

          <div>
            <select className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none">
              <option>Español</option>
              <option>English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
