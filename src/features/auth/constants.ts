// Rutas existentes en routes/AppRoutes.tsx (zona roja). SPEC-01 habla de /posts y /auth,
// pero en esta app el feed vive en "/" y el acceso en "/login".
export const AUTH_ROUTES = {
  home: "/",
  login: "/login",
  register: "/registro",
  verify: "/verificar",
  recover: "/recuperar",
  reset: "/restablecer",
} as const;

export const OTP_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 60;
export const PASSWORD_MIN_LENGTH = 10;

// Literal que devuelve el backend (SPEC-01) para cuentas sin verificar
export const ACCOUNT_PENDING_MESSAGE =
  "Debes verificar tu cuenta institucional antes de iniciar sesión";
