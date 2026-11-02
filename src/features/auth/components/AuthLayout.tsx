import { useEffect, type ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "@/components/brand/Brand";
import "../styles/auth.css";

/** Marco visual del acceso: comparte la identidad pública sin cambiar las reglas de SPEC-01. */
export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title.replace(/[.!]$/, "")} · LuminaUL`;
    return () => {
      document.title = previous;
    };
  }, [title]);
  return (
    <div className="auth-layout auth-refresh">
      <header className="auth-public-header">
        <Link to="/" aria-label="LuminaUL, volver a la presentación">
          <Brand />
        </Link>
        <Link to="/" className="auth-back">
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </header>
      <aside className="auth-story">
        <div className="auth-story-content">
          <span className="auth-story-eyebrow">
            APRENDER TAMBIÉN ES ENCONTRARSE
          </span>
          <h2>
            Lo que sabes
            <br />
            merece <em>compartirse.</em>
          </h2>
          <p>
            Un lugar para tus preguntas, tus ideas y las personas
            <br className="auth-desktop-break" /> con quienes vas a dar el
            siguiente paso.
          </p>
          <figure className="auth-community-photo">
            <img
              src="/media/estudio-en-comunidad.webp"
              width="1536"
              height="1024"
              alt="Estudiantes comparten apuntes y aprenden en comunidad"
            />
            <figcaption>
              <span>
                <Users size={17} />
              </span>
              Tu próximo grupo puede empezar aquí.
            </figcaption>
          </figure>
          <div className="auth-feature-pills">
            <span>
              <BookOpen size={14} />
              Comparte
            </span>
            <span>
              <Users size={14} />
              Conecta
            </span>
            <span>
              <MessageCircle size={14} />
              Conversa
            </span>
          </div>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-form">
          <span className="eyebrow">{eyebrow || "TU ESPACIO EN LUMINAUL"}</span>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
          {children}
          <div className="auth-trust">
            <ShieldCheck size={15} />
            <span>Una comunidad con identidad universitaria.</span>
          </div>
        </div>
      </main>
      <footer className="auth-public-footer">
        <span>© 2026 LuminaUL</span>
        <p>Lo que tú sabes puede iluminar el camino de alguien más.</p>
        <Link to="/nosotros#proposito">
          Conoce nuestro propósito
          <ArrowLeft size={13} />
        </Link>
      </footer>
    </div>
  );
}
