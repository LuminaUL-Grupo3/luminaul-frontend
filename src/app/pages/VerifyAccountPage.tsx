import { useState, useRef, KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Toast } from '../components/Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export function VerifyAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setCode(newCode.slice(0, 6));

    // Focus al último dígito pegado
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs[lastIndex].current?.focus();
  };

  const handleVerify = () => {
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Debes ingresar los 6 dígitos del código');
      return;
    }

    setIsLoading(true);

    // Simulación de verificación
    setTimeout(() => {
      setIsLoading(false);

      // Código correcto de ejemplo: 123456
      if (verificationCode === '123456') {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Código inválido o expirado');
        setCode(['', '', '', '', '', '']);
        inputRefs[0].current?.focus();
      }
    }, 1000);
  };

  const handleResendCode = () => {
    setToast({
      show: true,
      message: 'Código reenviado a tu correo',
      type: 'success',
    });
    setCode(['', '', '', '', '', '']);
    setError('');
    inputRefs[0].current?.focus();
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-white rounded-xl border border-border p-8 max-w-md w-full text-center animate-in zoom-in-95">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl mb-2">Cuenta verificada correctamente</h2>
          <p className="text-muted-foreground">
            Redirigiendo al inicio de sesión...
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
            <Mail className="w-8 h-8 text-primary" />
          </div>

          {/* Título */}
          <h1 className="text-3xl text-center mb-3">Verifica tu cuenta</h1>
          <p className="text-center text-muted-foreground mb-8">
            Hemos enviado un código de seguridad a tu correo institucional
            {email && (
              <span className="block mt-2 font-medium text-foreground">{email}</span>
            )}
          </p>

          {/* Campos de código */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-center mb-4">
              Código de verificación (6 dígitos)
            </label>
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg transition-colors focus:outline-none ${
                    error
                      ? 'border-destructive'
                      : digit
                      ? 'border-primary bg-primary/5'
                      : 'border-input focus:border-primary'
                  }`}
                />
              ))}
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="flex items-center justify-center gap-2 mt-4 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Botón verificar */}
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className={`w-full h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium mb-4 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Verificando...' : 'Verificar'}
          </button>

          {/* Link reenviar código */}
          <div className="text-center">
            <button
              onClick={handleResendCode}
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Reenviar código
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-900 text-center mb-2">
            <strong>Código de prueba:</strong> 123456
          </p>
          <p className="text-xs text-blue-800 text-center">
            En producción, este código se enviaría por correo electrónico
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            ¿No recibiste el código? Revisa tu carpeta de spam
          </p>
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
