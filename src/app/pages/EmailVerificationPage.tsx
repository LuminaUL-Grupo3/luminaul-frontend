import { useLocation, useNavigate, Link } from 'react-router';
import { Mail, CheckCircle } from 'lucide-react';

export function EmailVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'tu correo';

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-2xl font-semibold text-foreground">LuminaUL</span>
        </div>

        <div className="bg-white rounded-xl border border-border p-8 text-center">
          {/* Ícono */}
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          {/* Título */}
          <h1 className="text-3xl mb-3">Verifica tu correo</h1>
          <p className="text-muted-foreground mb-6">
            Hemos enviado un correo de verificación a:
          </p>
          <p className="text-lg font-medium text-foreground mb-8">
            {email}
          </p>

          {/* Instrucciones */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-8 text-left">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Pasos a seguir:</h3>
            <div className="space-y-3">
              <div className="flex gap-3 text-sm text-blue-800">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Abre tu correo institucional</span>
              </div>
              <div className="flex gap-3 text-sm text-blue-800">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Busca el correo de LuminaUL en tu bandeja de entrada</span>
              </div>
              <div className="flex gap-3 text-sm text-blue-800">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Haz clic en el enlace de verificación</span>
              </div>
              <div className="flex gap-3 text-sm text-blue-800">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>¡Listo! Ya podrás acceder a tu cuenta</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/verificar-cuenta', { state: { email } })}
              className="w-full h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Ingresar código de verificación
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full h-12 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Ir a inicio de sesión
            </button>
          </div>

          {/* Ayuda */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">
              ¿No recibiste el correo?
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Revisa tu carpeta de spam o correo no deseado</li>
              <li>• Asegúrate de que tu correo esté escrito correctamente</li>
              <li>• Espera unos minutos e intenta nuevamente</li>
            </ul>
          </div>

          <div className="mt-6">
            <Link
              to="/login"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
