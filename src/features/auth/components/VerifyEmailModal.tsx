import { FormEvent, useState } from "react";
import { Modal, Notice } from "../../../components/ui";
import { useFeedback } from "../../../hooks/useFeedback";
import { OtpInput } from "./OtpInput";
import { SubmitButton } from "./SubmitButton";
import {
  errorMessage,
  useResendCodeMutation,
  useVerifyEmailMutation,
} from "../hooks/useAuthMutations";
import { validateOtp } from "../utils/validation";
import "../styles/auth.css";

export function VerifyEmailModal({
  email,
  codeJustSent = false,
  close,
  onVerified,
}: {
  email: string;
  // true justo después del registro: el reenvío arranca bloqueado 60 s
  codeJustSent?: boolean;
  close: () => void;
  onVerified: () => void;
}) {
  const feedback = useFeedback();
  const verify = useVerifyEmailMutation();
  const resend = useResendCodeMutation(codeJustSent);
  const [code, setCode] = useState(""),
    [validationError, setValidationError] = useState(""),
    [info, setInfo] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const error = validateOtp(code);
    setValidationError(error);
    if (error) return;
    verify.mutate(
      { email, token: code },
      {
        onSuccess: (res) => {
          feedback.notify(res.message);
          onVerified();
        },
        onError: () => setCode(""),
      },
    );
  }

  function resendCode() {
    setInfo("");
    verify.reset();
    resend.mutate(email, {
      onSuccess: (res) => {
        setCode("");
        setInfo(res.message);
      },
    });
  }

  const error =
    validationError ||
    (verify.error ? errorMessage(verify.error) : "") ||
    (resend.error ? errorMessage(resend.error) : "");

  return (
    <Modal title="Verifica tu correo institucional" close={close}>
      <p className="verify-copy">
        Ingresa el código de 6 dígitos que enviamos a <strong>{email}</strong>. Vence en 15
        minutos.
      </p>
      <form className="form" onSubmit={submit} noValidate>
        <OtpInput value={code} onChange={setCode} disabled={verify.isPending} autoFocus />
        <Notice error>{error}</Notice>
        <Notice>{!error ? info : ""}</Notice>
        <SubmitButton pending={verify.isPending} pendingLabel="Verificando…">
          Verificar cuenta
        </SubmitButton>
        <div className="resend-row">
          ¿No te llegó?
          <button
            type="button"
            className="text-button"
            onClick={resendCode}
            disabled={!resend.canResend}
          >
            {resend.isPending
              ? "Enviando…"
              : resend.secondsLeft > 0
                ? `Reenviar código en ${resend.secondsLeft} s`
                : "Reenviar código"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
