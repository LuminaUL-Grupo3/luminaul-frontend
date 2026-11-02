import { useEffect, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "@/components/brand/Brand";
import "../styles/auth.css";

/** Acceso centrado, sin fotografía ni contenido promocional; conserva los formularios del equipo. */
export function AuthLayout({ eyebrow, title, description, children }: {
  eyebrow?: string; title: string; description?: ReactNode; children: ReactNode;
}) {
  useEffect(() => {
    const previous = document.title;
    document.title = title.replace(/[.!]$/, "") + " · LuminaUL";
    return () => { document.title = previous; };
  }, [title]);
  return <div className="auth-layout auth-refresh">
    <header className="auth-public-header">
      <Link to="/" aria-label="LuminaUL, volver a la presentación"><Brand /></Link>
      <Link to="/" className="auth-back"><ArrowLeft size={16} />Volver al inicio</Link>
    </header>
    <main className="auth-main"><div className="auth-form">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>{description && <p>{description}</p>}{children}
    </div></main>
    <footer className="auth-public-footer"><span>© 2026 LuminaUL</span><Link to="/nosotros">Sobre LuminaUL</Link></footer>
  </div>;
}
