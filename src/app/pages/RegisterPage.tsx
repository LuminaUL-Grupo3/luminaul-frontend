import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { InputField } from '../components/InputField';
import { Users, BookOpen, GraduationCap, MessageCircle, CheckCircle2 } from 'lucide-react';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar campos vacíos
    if (!email && !password && !confirmPassword) {
      newErrors.general = 'Debe ingresar todos los datos';
      setErrors(newErrors);
      return false;
    }

    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!email.endsWith('@aloe.ulima.edu.pe')) {
      newErrors.email = 'El correo ingresado no pertenece a la organización de la Universidad de Lima';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
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

    // Simular registro exitoso
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/verificar-correo', { state: { email } });
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-white rounded-xl border border-border p-8 max-w-md w-full mx-4 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl mb-2">Usuario registrado correctamente</h2>
          <p className="text-muted-foreground">
            Redirigiendo a verificación de correo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Columna izquierda - Ilustración */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Únete a la comunidad universitaria
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Crea tu cuenta en LuminaUL y comienza a colaborar con estudiantes de la Universidad de Lima.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Grupos de Estudio</h3>
                  <p className="text-sm text-muted-foreground">Conecta con compañeros de tus cursos</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Asesorías Personalizadas</h3>
                  <p className="text-sm text-muted-foreground">Encuentra o brinda ayuda académica</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Chat en Tiempo Real</h3>
                  <p className="text-sm text-muted-foreground">Comunícate con tu grupo</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Red Universitaria</h3>
                  <p className="text-sm text-muted-foreground">Amplía tu red académica</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Columna derecha - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-2xl font-semibold text-foreground">LuminaUL</span>
          </div>

          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Crear cuenta</h1>
            <p className="text-muted-foreground">
              Regístrate con tu correo institucional de la Universidad de Lima
            </p>
          </div>

          {/* Mensaje de error general */}
          {errors.general && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm font-medium">{errors.general}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Correo institucional"
              type="email"
              placeholder="ejemplo@aloe.ulima.edu.pe"
              value={email}
              onChange={setEmail}
              error={errors.email}
              required
            />

            <InputField
              label="Contraseña"
              type="password"
              placeholder="Mínimo 10 caracteres"
              value={password}
              onChange={setPassword}
              error={errors.password}
              required
            />

            <InputField
              label="Confirmar contraseña"
              type="password"
              placeholder="Vuelve a escribir tu contraseña"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              required
            />

            <button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Registrarme
            </button>
          </form>

          {/* Inicio de sesión */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* Información adicional */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Requisitos de la contraseña:</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <span>•</span>
                <span>Mínimo 10 caracteres</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Debe ser única y segura</span>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <p className="text-xs text-muted-foreground text-center">
              Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
