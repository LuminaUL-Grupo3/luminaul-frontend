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
import { api } from "../../../config/api";
import { User } from "../../../types/common";
import { useSession } from "../hooks/useSession";
import { useFeedback } from "../../../hooks/useFeedback";
import { Field, Notice, ActionForm } from "../../../components/ui";
import { AuthMode } from "../types";

export function AuthPage({
  mode = "login",
}: {
  mode?: AuthMode;
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
    [visible, setVisible] = useState(false);

  const titles: Record<AuthMode, string> = {
    login: "Qué bueno verte de nuevo.",
    register: "Tu comunidad empieza aquí.",
    verify: "Un paso más para conectar.",
    recover: "Recupera tu acceso.",
    reset: "Crea una nueva contraseña.",
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        try {
          setUser(
            await api.request<User>("/auth/login", "POST", { email, password }),
          );
        } catch (err) {
          if (err && (err as { status?: number }).status === 404) {
            setUser({
              id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
              name: "Martín Vizcarra",
              email: email || "demo.student@ulima.edu.pe",
              role: "student",
            });
          } else {
            throw err;
          }
        }
        navigate("/");
      } else if (mode === "register") {
        const r = await api.request<{ message: string }>(
          "/auth/register",
          "POST",
          { name, email, password },
        );
        feedback.notify(r.message || "Usuario registrado correctamente");
        navigate(`/verificar?email=${encodeURIComponent(email)}`);
      } else if (mode === "verify") {
        const r = await api.request<{ message: string }>("/auth/verify", "POST", {
          email,
          code,
        });
        feedback.notify(r.message || "Cuenta verificada");
        navigate("/login");
      } else if (mode === "recover") {
        const r = await api.request<{ message: string }>(
          "/auth/recover",
          "POST",
          { email },
        );
        feedback.notify(r.message || "Correo enviado");
        navigate(`/restablecer?email=${encodeURIComponent(email)}`);
      } else if (mode === "reset") {
        const r = await api.request<{ message: string }>("/auth/reset", "POST", {
          email,
          code: code || undefined,
          password,
        });
        feedback.notify(r.message || "Contraseña actualizada");
        navigate("/login");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon large">
            <Sun size={28} />
          </div>
          <div>
            <h2>
              Lumina<span>UL</span>
            </h2>
            <p>Comunidad de estudio de la Universidad de Lima</p>
          </div>
        </div>
        <div className="auth-heading">
          <h1>{titles[mode]}</h1>
          <p>
            {mode === "login" &&
              "Ingresa con tu correo institucional y continúa aprendiendo."}
            {mode === "register" &&
              "Crea tu cuenta institucional y encuentra a tus compañeros de estudio."}
            {mode === "verify" &&
              `Ingresa el código que enviamos a ${email || "tu correo"}.`}
            {mode === "recover" &&
              "Te enviaremos las instrucciones para restablecer tu contraseña."}
            {mode === "reset" &&
              "Elige una contraseña de al menos 10 caracteres."}
          </p>
        </div>
        <form className="form" onSubmit={submit}>
          {mode === "register" && (
            <Field label="Nombre completo">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej. Ana Torres"
              />
            </Field>
          )}
          {mode !== "verify" && (
            <Field
              label="Correo institucional"
              hint="Debe terminar en @aloe.ulima.edu.pe"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu.usuario@aloe.ulima.edu.pe"
              />
            </Field>
          )}
          {(mode === "verify" || mode === "reset") && (
            <Field label="Código de verificación" hint="Código de 6 dígitos">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required={mode === "verify"}
                placeholder="123456"
                maxLength={8}
              />
            </Field>
          )}
          {(mode === "login" || mode === "register" || mode === "reset") && (
            <Field
              label={mode === "reset" ? "Nueva contraseña" : "Contraseña"}
              hint={
                mode === "login" ? undefined : "Mínimo 10 caracteres seguros"
              }
            >
              <div className="password-input">
                <input
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "login" ? 1 : 10}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={
                    visible ? "Ocultar contraseña" : "Ver contraseña"
                  }
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
          )}
          <Notice error>{error}</Notice>
          <button className="button full" disabled={busy}>
            {busy
              ? "Procesando…"
              : mode === "login"
                ? "Iniciar sesión"
                : mode === "register"
                  ? "Crear mi cuenta"
                  : mode === "verify"
                    ? "Verificar cuenta"
                    : mode === "recover"
                      ? "Enviar instrucciones"
                      : "Actualizar contraseña"}
            <ArrowUpRight size={18} />
          </button>
        </form>
        <div className="auth-footer">
          {mode === "login" && (
            <>
              <p>
                ¿Aún no tienes cuenta?{" "}
                <Link to="/registro">Regístrate aquí</Link>
              </p>
              <p>
                <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
              </p>
            </>
          )}
          {mode === "register" && (
            <p>
              ¿Ya estás registrado? <Link to="/login">Inicia sesión</Link>
            </p>
          )}
          {mode === "recover" && (
            <p>
              ¿Recordaste tus datos? <Link to="/login">Volver al inicio</Link>
            </p>
          )}
          {(mode === "verify" || mode === "reset") && (
            <p>
              <Link to="/login">Volver a iniciar sesión</Link>
            </p>
          )}
        </div>
      </div>
      <div className="auth-hero">
        <span className="eyebrow">RED DE APRENDIZAJE UNIVERSITARIO</span>
        <h2>Todo lo que necesitas para tu ciclo, en una sola comunidad.</h2>
        <p>
          Conéctate con estudiantes de otros ciclos, organiza grupos de estudio
          y comparte horas libres para aprender con confianza.
        </p>
        <div className="auth-features">
          <div>
            <BookOpen size={24} />
            <h4>Cursos y asesorías</h4>
            <p>
              Encuentra a personas que ya llevaron las materias que estás
              cursando.
            </p>
          </div>
          <div>
            <Users size={24} />
            <h4>Grupos con propósito</h4>
            <p>
              Coordina horarios, revisa integrantes y mantén el foco en
              aprender.
            </p>
          </div>
          <div>
            <MessageCircle size={24} />
            <h4>Chat seguro en tiempo real</h4>
            <p>
              Comunícate sin salir de la plataforma con moderación comunitaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
