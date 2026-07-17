interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };

    if (password.length < 10) {
      return { level: 1, text: 'Débil', color: 'bg-red-500' };
    }

    let strength = 0;
    if (password.length >= 10) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      return { level: 1, text: 'Débil', color: 'bg-red-500' };
    } else if (strength <= 4) {
      return { level: 2, text: 'Media', color: 'bg-yellow-500' };
    } else {
      return { level: 3, text: 'Fuerte', color: 'bg-green-500' };
    }
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Seguridad de la contraseña:</span>
        <span className={`text-sm font-medium ${
          strength.level === 1 ? 'text-red-600' :
          strength.level === 2 ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {strength.text}
        </span>
      </div>
      <div className="flex gap-2">
        <div className={`h-2 flex-1 rounded-full transition-colors ${
          strength.level >= 1 ? strength.color : 'bg-secondary'
        }`}></div>
        <div className={`h-2 flex-1 rounded-full transition-colors ${
          strength.level >= 2 ? strength.color : 'bg-secondary'
        }`}></div>
        <div className={`h-2 flex-1 rounded-full transition-colors ${
          strength.level >= 3 ? strength.color : 'bg-secondary'
        }`}></div>
      </div>
    </div>
  );
}
