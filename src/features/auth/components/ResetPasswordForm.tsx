import { FormEvent, useState } from "react";
import { Field, Notice } from "../../../components/ui";
import { OtpInput } from "./OtpInput";
import { PasswordInput } from "./PasswordInput";
import { SubmitButton } from "./SubmitButton";
import {
  errorMessage,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../hooks/useAuthMutations";
import { useCountdown } from "../hooks/useCountdown";
import { validatePasswordReset } from "../utils/validation";
import { PASSWORD_MIN_LENGTH, RESEND_COOLDOWN_SECONDS } from "../constants";
import "../styles/auth.css";

export function ResetPasswordForm({
  initialEmail = "",
  codeJustSent = false,
  onReset,
}: {
  initialEmail?: string;
  codeJustSent?: boolean;
  onReset: (message: string) => void;
}) {
  const reset = useResetPasswordMutation();
  const resend = useForgotPasswordMutation();
  const cooldown = useCountdown(codeJustSent ? RESEND_COOLDOWN_SECONDS : 0);
  const [email, setEmail] = useState(initialEmail),
    [code, setCode] = useState(""),
    [password, setPassword] = useState(""),
    [validationError, setValidationError] = useState(""),
    [info, setInfo] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const payload = { email, token: code, newPassword: password };
    const error = validatePasswordReset(payload);
    setValidationError(error);
    if (error) return;
    reset.mutate(payload, { onSuccess: (res) => onReset(res.message) });
  }

  function resendCode() {
    setInfo("");
    resend.mutate(
      { email },
      {
        onSuccess: (res) => {
          setInfo(res.message);
          cooldown.start(RESEND_COOLDOWN_SECONDS);
        },
      },
    );
  }

  const error =
    validationError ||
    (reset.error ? errorMessage(reset.error) : "") ||
    (resend.error ? errorMessage(resend.error) : "");

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field label="Correo institucional">
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu.usuario@aloe.ulima.edu.pe"
        />
      </Field>
      <div className="field">
        <span>Código de recuperación</span>
        <OtpInput value={code} onChange={setCode} label="Código de recuperación" />
        <small>Lo enviamos a tu correo; vence en 15 minutos.</small>
      </div>
      <Field label="Nueva contraseña" hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}>
        <PasswordInput
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
        />
      </Field>
      <Notice error>{error}</Notice>
      <Notice>{!error ? info : ""}</Notice>
      <SubmitButton pending={reset.isPending} pendingLabel="Actualizando…">
        Actualizar contraseña
      </SubmitButton>
      <div className="resend-row">
        ¿No te llegó?
        <button
          type="button"
          className="text-button"
          onClick={resendCode}
          disabled={!email.trim() || cooldown.isRunning || resend.isPending}
        >
          {resend.isPending
            ? "Enviando…"
            : cooldown.isRunning
              ? `Reenviar código en ${cooldown.secondsLeft} s`
              : "Reenviar código"}
        </button>
      </div>
    </form>
  );
}
