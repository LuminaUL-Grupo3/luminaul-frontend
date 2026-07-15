import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { InputField } from '../components/InputField';
import { Toast } from '../components/Toast';
import { Users, BookOpen, GraduationCap, MessageCircle } from 'lucide-react';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email && !password) {
      newErrors.general = 'Debe ingresar todos los datos';
      setErrors(newErrors);
      return false;
    }

    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!email.includes('@aloe.ulima.edu.pe')) {
      newErrors.email = 'Debe usar su correo institucional';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
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

    // Simulación de autenticación
    // En producción, aquí iría la llamada a la API
    if (email === 'estudiante@aloe.ulima.edu.pe' && password === 'password123') {
      setToast({
        show: true,
        message: 'Inicio de sesión exitoso',
        type: 'success',
      });
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setErrors({ general: 'Credenciales incorrectas' });
    }
  };

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
              Conecta, aprende y crece con tu comunidad universitaria
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              LuminaUL es la plataforma que une a estudiantes de la Universidad de Lima para compartir conocimientos y crear grupos de estudio.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Grupos de Estudio</h3>
                  <p className="text-sm text-muted-foreground">Únete a grupos de tus cursos</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Asesorías</h3>
                  <p className="text-sm text-muted-foreground">Encuentra ayuda personalizada</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Comunidad Activa</h3>
                  <p className="text-sm text-muted-foreground">Comparte y colabora</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Éxito Académico</h3>
                  <p className="text-sm text-muted-foreground">Mejora tu rendimiento</p>
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
            <h1 className="text-3xl mb-2">Bienvenido a LuminaUL</h1>
            <p className="text-muted-foreground">
              Conecta con asesorías y grupos de estudio de la Universidad de Lima
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
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={setPassword}
              error={errors.password}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary accent-primary rounded border-input"
                />
                <span className="text-sm text-foreground">Recordar sesión</span>
              </label>

              <Link
                to="/recuperar-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Ingresar
            </button>
          </form>

          {/* Registro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link
                to="/registro"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Regístrate
              </Link>
            </p>
          </div>

          {/* Información adicional */}
          <div className="mt-8 pt-8 border-t border-border space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
            </p>
            <p className="text-xs text-center">
              <Link
                to="/cuenta-suspendida"
                className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
              >
                HU 7.1 — Cuenta suspendida (demo)
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
