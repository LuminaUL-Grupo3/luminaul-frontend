import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { InputField } from '../components/InputField';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar campo vacío
    if (!email) {
      setError('Debe ingresar su correo institucional');
      return;
    }

    // Validar formato de correo institucional
    if (!email.endsWith('@aloe.ulima.edu.pe')) {
      setError('Debe usar su correo institucional (@aloe.ulima.edu.pe)');
      return;
    }

    setIsLoading(true);

    // Simulación de envío
    setTimeout(() => {
      setIsLoading(false);

      // Simular que solo existe cuenta para "estudiante@aloe.ulima.edu.pe"
      if (email === 'estudiante@aloe.ulima.edu.pe') {
        setShowSuccess(true);
      } else {
        setError('No existe una cuenta asociada a este correo');
      }
    }, 1000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-2xl font-semibold text-foreground">LuminaUL</span>
          </div>

          {/* Card de éxito */}
          <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>

              <h1 className="text-3xl mb-3">Correo de recuperación enviado</h1>
              <p className="text-muted-foreground mb-6">
                Hemos enviado un enlace de recuperación a:
              </p>
              <p className="text-lg font-medium text-foreground mb-8">
                {email}
              </p>

              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6 text-left">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Pasos a seguir:</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 text-sm text-blue-800">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Revisa tu correo institucional</span>
                  </div>
                  <div className="flex gap-3 text-sm text-blue-800">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Busca el correo de LuminaUL</span>
                  </div>
                  <div className="flex gap-3 text-sm text-blue-800">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Haz clic en el enlace de recuperación</span>
                  </div>
                  <div className="flex gap-3 text-sm text-blue-800">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Crea tu nueva contraseña</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/actualizar-password')}
                className="w-full h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium mb-3"
              >
                Ir a actualizar contraseña
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full h-12 border border-border rounded-lg hover:bg-secondary transition-colors font-medium mb-3"
              >
                Ir a inicio de sesión
              </button>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full h-12 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
              >
                Enviar nuevamente
              </button>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  ¿No recibiste el correo? Revisa tu carpeta de spam o correo no deseado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-2xl font-semibold text-foreground">LuminaUL</span>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
          {/* Ícono */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          {/* Título */}
          <h1 className="text-3xl text-center mb-3">Recuperar contraseña</h1>
          <p className="text-center text-muted-foreground mb-8">
            Ingrese su correo institucional para recibir un enlace de recuperación.
          </p>

          {/* Mensaje de error general */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Correo institucional"
              type="email"
              placeholder="ejemplo@aloe.ulima.edu.pe"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setError('');
              }}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Enviando...' : 'Enviar correo'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 h-12 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio de sesión
            </button>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-900 text-center mb-2">
            <strong>Correo de prueba:</strong> estudiante@aloe.ulima.edu.pe
          </p>
          <p className="text-xs text-blue-800 text-center">
            En producción, este enlace se enviaría por correo electrónico
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Si no recuerdas tu correo institucional, contacta al administrador
          </p>
        </div>
      </div>
    </div>
  );
}

