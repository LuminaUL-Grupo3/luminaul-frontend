import { FormEvent, useState } from "react";
import { Field, Notice } from "../../../components/ui";
import { PasswordInput } from "./PasswordInput";
import { SubmitButton } from "./SubmitButton";
import { errorMessage, useRegisterMutation } from "../hooks/useAuthMutations";
import { normalizeEmail, validateRegistration } from "../utils/validation";
import { PASSWORD_MIN_LENGTH } from "../constants";

export function RegisterForm({
  onRegistered,
}: {
  // Se llama con el correo normalizado para abrir VerifyEmailModal
  onRegistered: (email: string) => void;
}) {
  const register = useRegisterMutation();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [validationError, setValidationError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const error = validateRegistration({ name, email, password });
    setValidationError(error);
    if (error) return;
    register.mutate(
      { name, email, password },
      { onSuccess: () => onRegistered(normalizeEmail(email)) },
    );
  }

  const error = validationError || (register.error ? errorMessage(register.error) : "");

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field label="Nombre completo">
        <input
          autoComplete="name"
          maxLength={150}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Ana Torres"
        />
      </Field>
      <Field label="Correo institucional" hint="Debe terminar en @aloe.ulima.edu.pe">
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu.usuario@aloe.ulima.edu.pe"
        />
      </Field>
      <Field label="Contraseña" hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}>
        <PasswordInput
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
        />
      </Field>
      <Notice error>{error}</Notice>
      <SubmitButton pending={register.isPending} pendingLabel="Creando tu cuenta…">
        Crear mi cuenta
      </SubmitButton>
    </form>
  );
}
