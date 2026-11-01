// Contratos HTTP de SPEC-01 (espejo de los DTOs del backend en src/auth/dto)

export type UserRole = "student" | "admin";
export type UserAccountStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "deleted";

export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserAccountStatus;
  isVerified: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  status: UserAccountStatus;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUserDto;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  isVerified: boolean;
}

export interface ResendCodeRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}
