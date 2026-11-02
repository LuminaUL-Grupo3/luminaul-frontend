import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Notice } from "../../../components/ui";
import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";
import { VerifyEmailModal } from "../components/VerifyEmailModal";
import { ResetPasswordPage } from "./ResetPasswordPage";
import { useSession } from "../hooks/useSession";
import { AUTH_ROUTES } from "../constants";
import { AuthMode } from "../types";

interface PendingVerification {
  email: string;
  codeJustSent: boolean;
}

const COPY = {
  login: {
    title: "Qué bueno verte.",
    description:
      "Tu comunidad te espera. Ingresa con tu correo institucional para continuar.",
  },
  register: {
    title: "Tu comunidad empieza aquí.",
    description:
      "Crea tu cuenta con tu correo institucional y comparte lo que te mueve a aprender.",
  },
} as const;

// Contenedor de acceso: alterna entre inicio de sesión y registro, y abre VerifyEmailModal.
// Los modos recover/reset se conservan porque AppRoutes los usa; delegan en ResetPasswordPage.
export function AuthPage({ mode = "login" }: { mode?: AuthMode }) {
  const { user } = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const emailParam = params.get("email") ?? "";
  // /verificar?email=... abre el modal directamente
  const [pending, setPending] = useState<PendingVerification | null>(
    mode === "verify" && emailParam
      ? { email: emailParam, codeJustSent: false }
      : null,
  );

  if (mode === "recover" || mode === "reset") {
    return (
      <ResetPasswordPage initialStep={mode === "reset" ? "reset" : "request"} />
    );
  }
  if (user) return <Navigate to={AUTH_ROUTES.home} replace />;

  const view = mode === "register" ? "register" : "login";

  function onVerified(email: string) {
    setPending(null);
    navigate(
      `${AUTH_ROUTES.login}?email=${encodeURIComponent(email)}&verificada=1`,
      {
        replace: true,
      },
    );
  }

  return (
    <AuthLayout title={COPY[view].title} description={COPY[view].description}>
      {mode === "verify" && !emailParam && (
        <Notice>Inicia sesión con tu cuenta para verificarla.</Notice>
      )}
      {params.get("verificada") && (
        <Notice>Tu cuenta está verificada. Ya puedes iniciar sesión.</Notice>
      )}

      {view === "login" ? (
        <LoginForm
          initialEmail={emailParam}
          onPendingVerification={(email) =>
            setPending({ email, codeJustSent: false })
          }
        />
      ) : (
        <RegisterForm
          onRegistered={(email) => setPending({ email, codeJustSent: true })}
        />
      )}

      <p className="auth-switch">
        {view === "login" ? (
          <>
            ¿Aún no tienes cuenta?{" "}
            <Link to={AUTH_ROUTES.register}>Regístrate aquí</Link>
          </>
        ) : (
          <>
            ¿Ya estás registrado?{" "}
            <Link to={AUTH_ROUTES.login}>Inicia sesión</Link>
          </>
        )}
      </p>

      {pending && (
        <VerifyEmailModal
          email={pending.email}
          codeJustSent={pending.codeJustSent}
          close={() => setPending(null)}
          onVerified={() => onVerified(pending.email)}
        />
      )}
    </AuthLayout>
  );
}
