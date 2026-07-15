import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { InputField } from '../components/InputField';
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar campos vacíos
    if (!password && !confirmPassword) {
      newErrors.general = 'Debe ingresar todos los datos';
      setErrors(newErrors);
      return false;
    }

    if (!password) {
      newErrors.password = 'La nueva contraseña es requerida';
    } else if (password.length < 10) {
      newErrors.password = 'La contraseña debe tener por lo menos 10 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulación de actualización
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-white rounded-xl border border-border p-8 max-w-md w-full text-center animate-in zoom-in-95">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl mb-2">Contraseña actualizada correctamente</h2>
          <p className="text-muted-foreground">
            Tu contraseña ha sido cambiada exitosamente. Redirigiendo al inicio de sesión...
          </p>
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
            <Lock className="w-8 h-8 text-primary" />
          </div>

          {/* Título */}
          <h1 className="text-3xl text-center mb-3">Actualizar contraseña</h1>
          <p className="text-center text-muted-foreground mb-8">
            Ingresa tu nueva contraseña. Asegúrate de que sea segura y tenga al menos 10 caracteres.
          </p>

          {/* Mensaje de error general */}
          {errors.general && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-destructive text-sm font-medium">{errors.general}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <InputField
                label="Nueva contraseña"
                type="password"
                placeholder="Mínimo 10 caracteres"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setErrors({ ...errors, password: undefined, general: undefined });
                }}
                error={errors.password}
                required
              />
              <PasswordStrengthIndicator password={password} />
            </div>

            <InputField
              label="Confirmar contraseña"
              type="password"
              placeholder="Vuelve a escribir tu contraseña"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                setErrors({ ...errors, confirmPassword: undefined, general: undefined });
              }}
              error={errors.confirmPassword}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Confirmando...' : 'Confirmar'}
            </button>
          </form>
        </div>

        {/* Requisitos de contraseña */}
        <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Requisitos de la contraseña:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className={password.length >= 10 ? '✓' : '•'}>
                {password.length >= 10 ? '✓' : '•'}
              </span>
              <span className={password.length >= 10 ? 'text-green-700' : ''}>
                Mínimo 10 caracteres
              </span>
            </li>
            <li className="flex gap-2">
              <span className={/[A-Z]/.test(password) ? '✓' : '•'}>
                {/[A-Z]/.test(password) ? '✓' : '•'}
              </span>
              <span className={/[A-Z]/.test(password) ? 'text-green-700' : ''}>
                Al menos una letra mayúscula (recomendado)
              </span>
            </li>
            <li className="flex gap-2">
              <span className={/[0-9]/.test(password) ? '✓' : '•'}>
                {/[0-9]/.test(password) ? '✓' : '•'}
              </span>
              <span className={/[0-9]/.test(password) ? 'text-green-700' : ''}>
                Al menos un número (recomendado)
              </span>
            </li>
            <li className="flex gap-2">
              <span className={/[^A-Za-z0-9]/.test(password) ? '✓' : '•'}>
                {/[^A-Za-z0-9]/.test(password) ? '✓' : '•'}
              </span>
              <span className={/[^A-Za-z0-9]/.test(password) ? 'text-green-700' : ''}>
                Al menos un carácter especial (recomendado)
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Usa una contraseña única que no hayas usado en otros sitios
          </p>
        </div>
      </div>
    </div>
  );
}
