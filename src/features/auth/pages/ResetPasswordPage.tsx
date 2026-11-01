import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Notice } from "../../../components/ui";
import { useFeedback } from "../../../hooks/useFeedback";
import { AuthLayout } from "../components/AuthLayout";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import { ResetPasswordForm } from "../components/ResetPasswordForm";
import { AUTH_ROUTES } from "../constants";

type RecoveryStep = "request" | "reset";

// Recuperación en dos pasos: pedir el código y luego fijar la nueva contraseña
export function ResetPasswordPage({ initialStep = "request" }: { initialStep?: RecoveryStep }) {
  const feedback = useFeedback();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState<RecoveryStep>(initialStep),
    [email, setEmail] = useState(params.get("email") ?? ""),
    [codeJustSent, setCodeJustSent] = useState(false),
    [info, setInfo] = useState("");

  return (
    <AuthLayout
      eyebrow={`PASO ${step === "request" ? 1 : 2} DE 2`}
      title={step === "request" ? "Recupera tu acceso." : "Crea una nueva contraseña."}
      description={
        step === "request"
          ? "Te enviaremos un código de 6 dígitos a tu correo institucional."
          : "Ingresa el código que recibiste y elige una contraseña nueva. Se cerrarán tus otras sesiones."
      }
    >
      <div className="auth-steps" aria-hidden="true">
        <span className="done" />
        <span className={step === "reset" ? "done" : ""} />
      </div>
      {step === "request" ? (
        <ForgotPasswordForm
          initialEmail={email}
          onCodeSent={(sentTo, message) => {
            setEmail(sentTo);
            setInfo(message);
            setCodeJustSent(true);
            setStep("reset");
          }}
        />
      ) : (
        <>
          <Notice>{info}</Notice>
          <ResetPasswordForm
            initialEmail={email}
            codeJustSent={codeJustSent}
            onReset={(message) => {
              feedback.notify(message);
              navigate(`${AUTH_ROUTES.login}?email=${encodeURIComponent(email)}`, {
                replace: true,
              });
            }}
          />
        </>
      )}
      <p className="auth-switch">
        ¿Recordaste tu contraseña? <Link to={AUTH_ROUTES.login}>Volver a iniciar sesión</Link>
      </p>
    </AuthLayout>
  );
}
