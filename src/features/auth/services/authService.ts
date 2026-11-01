import { api } from "../../../config/api";
import {
  AuthUserDto,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
  ResendCodeRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "../types";

// Adapter de la API de SPEC-01 sobre el cliente HTTP compartido (config/api.ts).
// La sesión viaja en la cookie httpOnly que deja el login (credentials: "include").
export const authService = {
  register(payload: RegisterRequest): Promise<RegisterResponse> {
    return api.request<RegisterResponse>("/auth/register", "POST", payload);
  },

  login(payload: LoginRequest): Promise<LoginResponse> {
    return api.request<LoginResponse>("/auth/login", "POST", payload);
  },

  me(): Promise<AuthUserDto> {
    return api.request<AuthUserDto>("/auth/me");
  },

  verifyEmail(payload: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return api.request<VerifyEmailResponse>("/auth/verify-email", "POST", payload);
  },

  resendCode(payload: ResendCodeRequest): Promise<MessageResponse> {
    return api.request<MessageResponse>("/auth/resend-code", "POST", payload);
  },

  forgotPassword(payload: ForgotPasswordRequest): Promise<MessageResponse> {
    return api.request<MessageResponse>("/auth/forgot-password", "POST", payload);
  },

  resetPassword(payload: ResetPasswordRequest): Promise<MessageResponse> {
    return api.request<MessageResponse>("/auth/reset-password", "POST", payload);
  },

  // Un 401 significa que la sesión ya estaba cerrada: para el cliente es un logout exitoso
  async logout(): Promise<void> {
    try {
      await api.request<MessageResponse>("/auth/logout", "POST");
    } catch (e) {
      if ((e as { status?: number }).status !== 401) throw e;
    }
  },

  deleteAccount(): Promise<MessageResponse> {
    return api.request<MessageResponse>("/auth/me", "DELETE");
  },
};
