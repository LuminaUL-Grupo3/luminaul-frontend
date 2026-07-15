import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShieldX, AlertTriangle, Mail, HeadphonesIcon, ArrowLeft } from 'lucide-react';
import { InputField } from '../components/InputField';

export function SuspendedLoginPage() {
  const navigate = useNavigate();

  // Simula que el usuario intenta ingresar con la cuenta suspendida
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [attempted, setAttempted] = useState(false);

  const SUSPENDED_ACCOUNT = {
    email: 'anonimo32@aloe.ulima.edu.pe',
    reason: 'Lenguaje ofensivo reiterado y comportamiento inapropiado en grupos de estudio.',
    date: '29 jun 2025',
    type: 'Suspensión permanente',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula intento con cuenta suspendida
    if (email === SUSPENDED_ACCOUNT.email) {
      setAttempted(true);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Columna izquierda — igual que LoginPage */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          <div className="max-w-md text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldX className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Acceso restringido</h2>
            <p className="text-muted-foreground">
              Esta cuenta ha sido suspendida por el equipo de moderación de LuminaUL.
            </p>
          </div>
        </div>
      </div>

      {/* Columna derecha — formulario + estado de error */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-2xl font-semibold text-foreground">LuminaUL</span>
          </div>

          {!attempted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl mb-2">Bienvenido a LuminaUL</h1>
                <p className="text-muted-foreground text-sm">
                  (Ingresa <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">{SUSPENDED_ACCOUNT.email}</span> para ver el estado de suspensión)
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                  label="Correo institucional"
                  type="email"
                  placeholder="ejemplo@aloe.ulima.edu.pe"
                  value={email}
                  onChange={setEmail}
                  required
                />
                <InputField
                  label="Contraseña"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={setPassword}
                  required
                />
                <button
                  type="submit"
                  className="w-full h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Ingresar
                </button>
              </form>
            </>
          ) : (
            /* ── Estado: cuenta suspendida ── */
            <div className="space-y-6 animate-in fade-in">
              {/* Error principal */}
              <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-destructive mb-1">Cuenta suspendida</h2>
                  <p className="text-sm text-red-700">
                    Tu cuenta ha sido suspendida por infringir las normas comunitarias.
                  </p>
                </div>
              </div>

              {/* Detalles */}
              <div className="bg-white rounded-xl border border-border divide-y divide-border">
                <div className="flex items-start gap-3 px-5 py-4">
                  <ShieldX className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Tipo de sanción</p>
                    <p className="text-sm font-medium text-foreground">{SUSPENDED_ACCOUNT.type}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-5 py-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Motivo de suspensión</p>
                    <p className="text-sm text-foreground">{SUSPENDED_ACCOUNT.reason}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-5 py-4">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Fecha de suspensión</p>
                    <p className="text-sm text-foreground">{SUSPENDED_ACCOUNT.date}</p>
                  </div>
                </div>
              </div>

              {/* Contactar soporte */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">¿Crees que fue un error?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Contacta al equipo de soporte para apelar tu caso.</p>
                </div>
                <Link
                  to="/contacto-soporte"
                  className="flex items-center gap-1.5 h-9 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex-shrink-0"
                >
                  <HeadphonesIcon className="w-4 h-4" />
                  Soporte
                </Link>
              </div>

              {/* Botón volver */}
              <button
                type="button"
                onClick={() => { setAttempted(false); setEmail(''); setPassword(''); }}
                className="w-full flex items-center justify-center gap-2 h-12 border border-border rounded-lg hover:border-foreground/30 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            </div>
          )}

          {/* Footer */}
          {!attempted && (
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
