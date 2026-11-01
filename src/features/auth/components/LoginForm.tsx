import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Field, Notice } from "../../../components/ui";
import { PasswordInput } from "./PasswordInput";
import { SubmitButton } from "./SubmitButton";
import {
  errorMessage,
  isPendingVerificationError,
  useLoginMutation,
} from "../hooks/useAuthMutations";
import { validateLogin } from "../utils/validation";
import { AUTH_ROUTES } from "../constants";

export function LoginForm({
  initialEmail = "",
  onPendingVerification,
}: {
  initialEmail?: string;
  // La cuenta existe pero falta verificarla: el contenedor abre VerifyEmailModal
  onPendingVerification: (email: string) => void;
}) {
  const login = useLoginMutation();
  const [email, setEmail] = useState(initialEmail),
    [password, setPassword] = useState(""),
    [validationError, setValidationError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const error = validateLogin({ email, password });
    setValidationError(error);
    if (error) return;
    login.mutate(
      { email, password },
      {
        onError: (err) => {
          if (isPendingVerificationError(err)) onPendingVerification(email);
        },
      },
    );
  }

  const error = validationError || (login.error ? errorMessage(login.error) : "");

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field label="Correo institucional" hint="Debe terminar en @aloe.ulima.edu.pe">
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@aloe.ulima.edu.pe"
        />
      </Field>
      <Field label="Contraseña">
        <PasswordInput
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
        />
      </Field>
      <Link className="forgot" to={AUTH_ROUTES.recover}>
        ¿Olvidaste tu contraseña?
      </Link>
      <Notice error>{error}</Notice>
      <SubmitButton pending={login.isPending} pendingLabel="Ingresando…">
        Iniciar sesión
      </SubmitButton>
    </form>
  );
}
