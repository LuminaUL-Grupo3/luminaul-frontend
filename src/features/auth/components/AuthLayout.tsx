import { ReactNode } from "react";
import { BookOpen, MessageCircle, Sun, Users } from "lucide-react";
import "../styles/auth.css";

// Marco de las pantallas de acceso: historia a la izquierda y formulario a la derecha
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
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <div className="brand">
          <span className="brand-icon">
            <Sun size={24} />
          </span>
          Lumina<span>UL</span>
        </div>
        <div className="auth-story-content">
          <h1>
            Todo lo que necesitas para tu ciclo, en <em>una sola comunidad</em>.
          </h1>
          <p>
            Conéctate con estudiantes de otros ciclos, organiza grupos de estudio y comparte
            horas libres para aprender con confianza.
          </p>
          <div className="auth-features">
            <span>
              <BookOpen /> Cursos y asesorías con quienes ya llevaron la materia
            </span>
            <span>
              <Users /> Grupos de estudio con horarios coordinados
            </span>
            <span>
              <MessageCircle /> Chat en tiempo real con moderación comunitaria
            </span>
          </div>
        </div>
        <p className="auth-footnote">LuminaUL</p>
        <span className="orbit" aria-hidden="true" />
        <span className="orbit orbit-two" aria-hidden="true" />
      </aside>
      <main className="auth-main">
        <div className="auth-form">
          <div className="brand mobile-brand">
            <span className="brand-icon">
              <Sun size={24} />
            </span>
            Lumina<span>UL</span>
          </div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
          {description && <p>{description}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
