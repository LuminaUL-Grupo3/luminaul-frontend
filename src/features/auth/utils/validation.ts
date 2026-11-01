import { OTP_LENGTH, PASSWORD_MIN_LENGTH } from "../constants";

// Mensajes de los criterios de aceptación H.U. 3.1 y 3.5
export const VALIDATION_MESSAGES = {
  required: "Debe ingresar todos los datos",
  institutionalEmail:
    "El correo ingresado no pertenece a la organización de la Universidad de Lima",
  passwordLength: `La contraseña debe tener por lo menos ${PASSWORD_MIN_LENGTH} caracteres`,
  otp: `El código de verificación debe contener ${OTP_LENGTH} dígitos`,
} as const;

const INSTITUTIONAL_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@aloe\.ulima\.edu\.pe$/;
const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`);

// Igual que el backend: sin espacios y en minúsculas
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isInstitutionalEmail = (email: string) =>
  INSTITUTIONAL_EMAIL_REGEX.test(normalizeEmail(email));

// Cada validador retorna el primer error encontrado, o "" si los datos son válidos
export function validateRegistration(data: {
  name: string;
  email: string;
  password: string;
}): string {
  if (!data.name.trim() || !data.email.trim() || !data.password) {
    return VALIDATION_MESSAGES.required;
  }
  if (!isInstitutionalEmail(data.email)) return VALIDATION_MESSAGES.institutionalEmail;
  if (data.password.length < PASSWORD_MIN_LENGTH) return VALIDATION_MESSAGES.passwordLength;
  return "";
}

export function validateLogin(data: { email: string; password: string }): string {
  return !data.email.trim() || !data.password ? VALIDATION_MESSAGES.required : "";
}

export function validateEmail(email: string): string {
  if (!email.trim()) return VALIDATION_MESSAGES.required;
  return isInstitutionalEmail(email) ? "" : VALIDATION_MESSAGES.institutionalEmail;
}

export function validateOtp(code: string): string {
  return OTP_REGEX.test(code) ? "" : VALIDATION_MESSAGES.otp;
}

export function validatePasswordReset(data: {
  email: string;
  token: string;
  newPassword: string;
}): string {
  if (!data.email.trim() || !data.token || !data.newPassword) {
    return VALIDATION_MESSAGES.required;
  }
  return (
    validateEmail(data.email) ||
    validateOtp(data.token) ||
    (data.newPassword.length < PASSWORD_MIN_LENGTH ? VALIDATION_MESSAGES.passwordLength : "")
  );
}
