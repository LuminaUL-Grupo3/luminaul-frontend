import { useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Users,
  MessageCircle,
  Sun,
  Eye,
  EyeOff,
} from "lucide-react";
import { api, User } from "./api";
import { useSession } from "./session";
import { useFeedback } from "./feedback";
import { Field, Notice, ActionForm } from "./ui";
export function AuthPage({
  mode = "login",
}: {
  mode?: "login" | "register" | "verify" | "recover" | "reset";
}) {
  const feedback = useFeedback();
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    { setUser } = useSession();
  const [email, setEmail] = useState(params.get("email") || ""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [visible, setVisible] = useState(false),
    [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; name?: string; code?: string }>({});
  const titles = {
    login: "Qué bueno verte de nuevo.",
    register: "Tu comunidad empieza aquí.",
    verify: "Un paso más para conectar.",
    recover: "Recupera tu acceso.",
    reset: "Crea una nueva contraseña.",
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (["login", "register", "verify"].includes(mode)) {
      const errors: typeof fieldErrors = {};
      if (!email.trim()) errors.email = "Ingresa tu correo institucional.";
      else if (!/^[^@\s]+@(aloe\.)?ulima\.edu\.pe$/i.test(email.trim()))
        errors.email = "Usa un correo @aloe.ulima.edu.pe o @ulima.edu.pe válido.";
      if (mode !== "verify") {
        if (!password) errors.password = "Ingresa tu contraseña.";
        else if (mode === "register" && password.length < 10) errors.password = "Usa al menos 10 caracteres.";
        else if (new TextEncoder().encode(password).length > 72) errors.password = "La contraseña supera el límite permitido.";
      }
      if (mode === "register" && name.trim().length < 2) errors.name = "Ingresa tu nombre completo.";
      if (mode === "verify" && !/^\d{6}$/.test(code)) errors.code = "Ingresa el código de seis dígitos que recibiste.";
      setFieldErrors(errors);
      if (Object.keys(errors).length) return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        setUser(await api.request<User>("/auth/login", "POST", {
          email: email.trim().toLowerCase(), password,
        }));
        navigate("/", { replace: true });
      } else if (mode === "register") {
        const result = await api.request<{ message: string }>("/auth/register", "POST", { name: name.trim(), email: email.trim().toLowerCase(), password });
        feedback.notify(result.message);
        navigate(`/verificar?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      } else {
        await api.request("/auth/verify", "POST", { email: email.trim().toLowerCase(), code });
        navigate("/login?verified=1");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Link className="brand" to="/">
          <span className="brand-icon">
            <Sun />
          </span>
          Lumina<span>UL</span>
        </Link>
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="auth-story-content">
          <span className="eyebrow">TU PRÓXIMO LOGRO EMPIEZA EN COMUNIDAD</span>
          <h1>
            Comparte lo que sabes.
            <br />
            <em>Descubre lo que puedes.</em>
          </h1>
          <p>
            Encuentra a las personas con quienes estudiar, resolver dudas y
            hacer que las ideas crezcan.
          </p>
          <div className="auth-features">
            <span>
              <BookOpen />
              Asesorías entre estudiantes
            </span>
            <span>
              <Users />
              Grupos para aprender juntos
            </span>
            <span>
              <MessageCircle />
              Conversaciones que conectan
            </span>
          </div>
        </div>
        <p className="auth-footnote">
          Universidad de Lima · Comunidad de aprendizaje
        </p>
      </aside>
      <main className="auth-main">
        <div className="auth-form">
          <Link className="mobile-brand brand" to="/">
            <Sun /> LuminaUL
          </Link>
          <span className="eyebrow">
            {mode === "login"
              ? "BIENVENIDO A LUMINAUL"
              : "UN ESPACIO PARA APRENDER"}
          </span>
          <h2>{titles[mode]}</h2>
          <p>
            {mode === "login"
              ? "Inicia sesión con tu correo institucional."
              : "Usa tu correo @aloe.ulima.edu.pe para continuar."}
          </p>
          <Notice>
            {params.has("verified")
              ? "Cuenta verificada. Ya puedes ingresar."
              : ""}
          </Notice>
          {["login", "register", "verify"].includes(mode) ? (
            <form className="form" onSubmit={submit} noValidate aria-busy={busy}>
              {mode === "register" && (
                <Field label="Nombre completo">
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    aria-label="Nombre completo"
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFieldErrors(v => ({ ...v, name: undefined })); }}
                  />
                  {fieldErrors.name && <small className="field-error" id="register-name-error">{fieldErrors.name}</small>}
                </Field>
              )}
              <Field label="Correo institucional">
                <input
                  type="email"
                  aria-label="Correo institucional"
                  required
                  autoComplete="email"
                  placeholder="tu.codigo@aloe.ulima.edu.pe"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((v) => ({ ...v, email: undefined })); }}
                />
                {fieldErrors.email && <small className="field-error" id="login-email-error">{fieldErrors.email}</small>}
              </Field>
              {mode === "verify" ? (
                <Field
                  label="Código de verificación"
                  hint="Revisa el correo recibido. El código vence en 15 minutos."
                >
                  <input
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    aria-label="Código de verificación"
                    autoComplete="one-time-code"
                    aria-invalid={Boolean(fieldErrors.code)}
                    aria-describedby={fieldErrors.code ? "verify-code-error" : undefined}
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setFieldErrors(v => ({ ...v, code: undefined })); }}
                  />
                  {fieldErrors.code && <small className="field-error" id="verify-code-error">{fieldErrors.code}</small>}
                </Field>
              ) : (
                <Field label="Contraseña">
                  <div className="password-input">
                    <input
                      type={visible ? "text" : "password"}
                      aria-label="Contraseña"
                      required
                      minLength={mode === "register" ? 10 : 1}
                      maxLength={128}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      value={password}
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors((v) => ({ ...v, password: undefined })); }}
                      placeholder={
                        mode === "register"
                          ? "Al menos 10 caracteres"
                          : "Tu contraseña"
                      }
                    />
                    <button
                      type="button"
                      aria-label={
                        visible ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                      onClick={() => setVisible(!visible)}
                    >
                      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && <small className="field-error" id="login-password-error">{fieldErrors.password}</small>}
                </Field>
              )}
              {mode === "login" && (
                <Link className="forgot" to="/recuperar">
                  Olvidé mi contraseña
                </Link>
              )}
              <Notice error>{error}</Notice>
              {mode === "verify" && import.meta.env.DEV && (
                <div className="mail-help notice">
                  <strong>¿No encuentras el mensaje?</strong>
                  <span>
                    En la versión local, los correos se guardan en el buzón de
                    pruebas.{" "}
                    <a
                      href="http://localhost:8026"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir buzón local
                    </a>{" "}
                    y busca el correo de LuminaUL para copiar el código.
                  </span>
                </div>
              )}
              <button className="button full" disabled={busy}>
                {busy
                  ? "Un momento…"
                  : mode === "login"
                    ? "Iniciar sesión"
                    : mode === "register"
                      ? "Crear mi cuenta"
                      : "Verificar cuenta"}
                <ArrowUpRight size={18} />
              </button>
            </form>
          ) : (
            <ActionForm
              path={mode === "recover" ? "/auth/recover" : "/auth/reset"}
              done={mode === "reset" ? () => navigate("/login") : undefined}
              payload={() =>
                mode === "recover"
                  ? { email: email.trim().toLowerCase() }
                  : { token: params.get("token") || "", password }
              }
              validate={() => mode === "recover"
                ? /^[^@\s]+@(aloe\.)?ulima\.edu\.pe$/i.test(email.trim()) ? "" : "Ingresa un correo institucional válido."
                : password.length < 10 ? "Usa al menos 10 caracteres." : new TextEncoder().encode(password).length > 72 ? "La contraseña supera el límite permitido." : !params.get("token") ? "El enlace no es válido. Solicita otro desde Recuperar acceso." : ""}
              label={
                mode === "recover"
                  ? "Enviar instrucciones"
                  : "Actualizar contraseña"
              }
            >
              {mode === "recover" ? (
                <Field label="Correo institucional">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
              ) : (
                <Field label="Nueva contraseña">
                  <input
                    type="password"
                    minLength={10}
                    maxLength={128}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
              )}
            </ActionForm>
          )}
          {mode === "verify" && (
            <button
              className="text-button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  const r = await api.request<{ message: string }>(
                    "/auth/verification",
                    "POST",
                    { email: email.trim().toLowerCase() },
                  );
                  feedback.notify(r.message);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Volver a enviar código
            </button>
          )}
          <p className="auth-switch">
            {mode === "login" ? (
              <>
                ¿Primera vez aquí? <Link to="/registro">Crea tu cuenta</Link>
              </>
            ) : (
              <Link to="/login">Volver al inicio de sesión</Link>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
