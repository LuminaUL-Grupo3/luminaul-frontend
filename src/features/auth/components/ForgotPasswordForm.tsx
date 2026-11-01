import { FormEvent, useState } from "react";
import { Field, Notice } from "../../../components/ui";
import { SubmitButton } from "./SubmitButton";
import { errorMessage, useForgotPasswordMutation } from "../hooks/useAuthMutations";
import { normalizeEmail, validateEmail } from "../utils/validation";

export function ForgotPasswordForm({
  initialEmail = "",
  onCodeSent,
}: {
  initialEmail?: string;
  onCodeSent: (email: string, message: string) => void;
}) {
  const forgot = useForgotPasswordMutation();
  const [email, setEmail] = useState(initialEmail),
    [validationError, setValidationError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const error = validateEmail(email);
    setValidationError(error);
    if (error) return;
    forgot.mutate(
      { email },
      { onSuccess: (res) => onCodeSent(normalizeEmail(email), res.message) },
    );
  }

  const error = validationError || (forgot.error ? errorMessage(forgot.error) : "");

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field label="Correo institucional" hint="Debe terminar en @aloe.ulima.edu.pe">
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu.usuario@aloe.ulima.edu.pe"
        />
      </Field>
      <Notice error>{error}</Notice>
      <SubmitButton pending={forgot.isPending} pendingLabel="Enviando…">
        Enviar código
      </SubmitButton>
    </form>
  );
}
