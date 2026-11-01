import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../../../config/api";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import { useClearSession } from "./useSession";
import { useCountdown } from "./useCountdown";
import { ACCOUNT_PENDING_MESSAGE, AUTH_ROUTES, RESEND_COOLDOWN_SECONDS } from "../constants";
import { normalizeEmail } from "../utils/validation";
import {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../types";

// El backend responde 403 con este literal cuando la cuenta aún no se verificó
export const isPendingVerificationError = (error: unknown) =>
  error instanceof ApiError && error.status === 403 && error.message === ACCOUNT_PENDING_MESSAGE;

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "No se pudo completar la operación";

// Guarda la sesión y entra al feed
export function useLoginMutation() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: LoginRequest) =>
      authService.login({ ...payload, email: normalizeEmail(payload.email) }),
    onSuccess: ({ user, accessToken }) => {
      useAuthStore.getState().setSession(user, accessToken);
      navigate(AUTH_ROUTES.home, { replace: true });
    },
  });
}

// Quien la usa abre VerifyEmailModal en onSuccess
export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) =>
      authService.register({
        ...payload,
        name: payload.name.trim(),
        email: normalizeEmail(payload.email),
      }),
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (payload: VerifyEmailRequest) =>
      authService.verifyEmail({ ...payload, email: normalizeEmail(payload.email) }),
  });
}

// Reenvío con temporizador de 60 s. initialCooldown: true cuando el código acaba de enviarse.
export function useResendCodeMutation(initialCooldown = false) {
  const countdown = useCountdown(initialCooldown ? RESEND_COOLDOWN_SECONDS : 0);
  const mutation = useMutation({
    mutationFn: (email: string) => authService.resendCode({ email: normalizeEmail(email) }),
    onSuccess: () => countdown.start(RESEND_COOLDOWN_SECONDS),
  });
  return {
    ...mutation,
    secondsLeft: countdown.secondsLeft,
    canResend: !countdown.isRunning && !mutation.isPending,
  };
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) =>
      authService.forgotPassword({ email: normalizeEmail(payload.email) }),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) =>
      authService.resetPassword({ ...payload, email: normalizeEmail(payload.email) }),
  });
}

// Revoca el token, vacía la caché de TanStack Query y el store, y vuelve al acceso
export function useLogoutMutation() {
  const navigate = useNavigate();
  const clearSession = useClearSession();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearSession();
      navigate(AUTH_ROUTES.login, { replace: true });
    },
  });
}

// Borrado lógico de la cuenta; el backend invalida todas sus sesiones
export function useDeleteAccountMutation() {
  const navigate = useNavigate();
  const clearSession = useClearSession();
  return useMutation({
    mutationFn: () => authService.deleteAccount(),
    onSuccess: () => {
      clearSession();
      navigate(AUTH_ROUTES.login, { replace: true });
    },
  });
}
