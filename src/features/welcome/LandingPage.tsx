import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  Lightbulb,
  Menu,
  Plus,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand/Brand";
import { useSession } from "@/features/auth";
import { experiences, purpose, questions } from "./content";
import "./welcome.css";

const CAMPUS_IMAGE = "/media/campus-ulima.webp";

/** Entrada pública: presenta el propósito del producto sin exigir una sesión. */
export function LandingPage() {
  const { user } = useSession();
  const { hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false),
    [selected, setSelected] = useState(0);
  const root = useRef<HTMLDivElement>(null),
    tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const experience = experiences[selected];
  const start = user ? "/" : "/registro";

  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() =>
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "LuminaUL · El conocimiento se comparte";
    // Las secciones aparecen al entrar en la vista; con movimiento reducido se muestran directamente.
    const elements =
      root.current?.querySelectorAll<HTMLElement>("[data-reveal]") || [];
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return () => {
        document.title = previousTitle;
      };
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.1 },
    );
    elements.forEach((element) => {
      element.classList.add("reveal-ready");
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    function escape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);

  /** Las pestañas se recorren también con flechas, Inicio y Fin, sin depender del ratón. */
  function changeTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % experiences.length
        : event.key === "ArrowLeft"
          ? (index + experiences.length - 1) % experiences.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? experiences.length - 1
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="landing-page" ref={root}>
      <a className="skip-link" href="#presentacion">
        Ir al contenido
      </a>
      <header className="welcome-header">
        <div className="welcome-nav">
          <Link to="/nosotros" aria-label="LuminaUL, presentación">
            <Brand />
          </Link>
          <button
            className="welcome-menu"
            aria-label={
              menuOpen
                ? "Cerrar menú de presentación"
                : "Abrir menú de presentación"
            }
            aria-expanded={menuOpen}
            aria-controls="welcome-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav
            id="welcome-navigation"
            className={menuOpen ? "is-open" : ""}
            aria-label="Presentación de LuminaUL"
          >
            <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
              Cómo funciona
            </a>
            <a href="#proposito" onClick={() => setMenuOpen(false)}>
              Nuestro propósito
            </a>
            <a href="#preguntas" onClick={() => setMenuOpen(false)}>
              Preguntas frecuentes
            </a>
            <Link className="welcome-login" to={user ? "/" : "/login"}>
              {user ? "Mi comunidad" : "Iniciar sesión"}
              <ArrowUpRight size={16} />
            </Link>
          </nav>
          <Link className="welcome-button nav-join" to={start}>
            {user ? "Volver a mi espacio" : "Quiero ser parte"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main id="presentacion">
        <section
          className="welcome-hero welcome-container"
          aria-labelledby="welcome-title"
        >
          <div className="welcome-hero-copy">
            <span className="welcome-eyebrow">
              <i />
              DE ESTUDIANTES, PARA ESTUDIANTES
            </span>
            <h1 id="welcome-title">
              El conocimiento
              <br />
              crece cuando
              <br />
              lo <em>compartes.</em>
              <svg
                className="welcome-underline"
                viewBox="0 0 340 18"
                aria-hidden="true"
              >
                <path
                  d="M4 12C96 1 242 0 335 9M20 16c96-7 201-6 286-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </h1>
            <p>
              Una duda, una idea, un curso en común. Encuentra a tu gente y
              transforma tu forma de aprender en la Universidad de Lima.
            </p>
            <div className="welcome-hero-actions">
              <Link className="welcome-button" to={start}>
                {user ? "Ir a mi comunidad" : "Encuentra tu comunidad"}
                <ArrowUpRight size={19} />
              </Link>
              <a className="welcome-text-link" href="#como-funciona">
                Así funciona
                <ArrowDown size={17} />
              </a>
            </div>
          </div>
          <div className="welcome-hero-visual">
            <div className="welcome-image-frame">
              <img
                src={CAMPUS_IMAGE}
                width="1860"
                height="900"
                alt="Edificio F1 y jardines del campus de la Universidad de Lima"
                fetchPriority="high"
              />
            </div>

            <a
              href="#como-funciona"
              className="welcome-photo-sticker"
              aria-label="Descubrir cómo aprender en comunidad"
            >
              <ArrowUpRight size={28} />
            </a>
            <a
              className="welcome-image-caption"
              href="https://www.ulima.edu.pe/campus"
              target="_blank"
              rel="noreferrer"
            >
              <i />
              CAMPUS · UNIVERSIDAD DE LIMA
              <ArrowUpRight size={12} />
            </a>
            <svg
              className="welcome-doodle"
              viewBox="0 0 60 65"
              aria-hidden="true"
            >
              <path
                d="m30 6-1 15M8 18l12 10M49 18 38 29M4 43l16-3M51 46l-12-6M27 59l1-13"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </section>



        <section
          className="welcome-experience welcome-container"
          id="como-funciona"
          aria-labelledby="experience-title"
          data-reveal
        >
          <div className="welcome-section-intro">
            <div>
              <span className="welcome-eyebrow">
                TU CICLO, CON MÁS CONEXIONES
              </span>
              <h2 id="experience-title">
                De «no entiendo»
                <br />a <em>«lo vemos juntos».</em>
              </h2>
            </div>
          </div>
          <div
            className="welcome-tabs"
            role="tablist"
            aria-label="Descubre lo que puedes hacer"
          >
            {experiences.map((item, index) => {
              const Icon = [BookOpen, Users, CalendarDays][index];
              return (
                <button
                  key={item.id}
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  role="tab"
                  id={`welcome-tab-${item.id}`}
                  aria-selected={selected === index}
                  aria-controls="welcome-experience-panel"
                  tabIndex={selected === index ? 0 : -1}
                  onClick={() => setSelected(index)}
                  onKeyDown={(event) => changeTab(event, index)}
                >
                  <span>0{index + 1}</span>
                  <Icon size={18} />
                  {item.label}
                  <ArrowUpRight size={18} />
                </button>
              );
            })}
          </div>
          <div
            className="welcome-experience-panel"
            id="welcome-experience-panel"
            role="tabpanel"
            aria-labelledby={`welcome-tab-${experience.id}`}
            tabIndex={0}
          >
            <div className="welcome-experience-copy" key={experience.id}>
              <h3>{experience.title}</h3>
              <p>{experience.description}</p>

              <Link
                className="welcome-text-link"
                to={user ? experience.route : "/registro"}
              >
                {experience.cta}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section
          className="welcome-purpose"
          id="proposito"
          aria-labelledby="purpose-title"
        >
          <div className="welcome-container">
            <div className="welcome-purpose-heading" data-reveal>
              <span className="welcome-eyebrow">UNA IDEA QUE NOS CONECTA</span>
              <h2 id="purpose-title">
                Todos tenemos algo
                <br />
                que <em>dar. Y algo que aprender.</em>
              </h2>
            </div>
            <div className="welcome-purpose-grid">
              {purpose.map((item) => (
                <article key={item.label} data-reveal>
                  <span className="welcome-purpose-number">
                    {item.number}
                    <ArrowUpRight size={19} />
                  </span>
                  <span className="welcome-eyebrow">{item.label}</span>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <div className="welcome-values" data-reveal>
              <div>
                <span className="welcome-eyebrow">LO QUE NOS GUÍA</span>
                <h3>
                  La forma en que
                  <br />
                  queremos encontrarnos.
                </h3>
              </div>
              <ul>
                <li>
                  <HeartHandshake size={20} />
                  Colaboración
                </li>
                <li>
                  <Users size={20} />
                  Respeto
                </li>
                <li>
                  <ShieldCheck size={20} />
                  Confianza
                </li>
                <li>
                  <Lightbulb size={20} />
                  Empatía
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section
          className="welcome-faq welcome-container"
          id="preguntas"
          aria-labelledby="faq-title"
          data-reveal
        >
          <div>
            <span className="welcome-eyebrow">ANTES DE DAR EL PRIMER PASO</span>
            <h2 id="faq-title">
              Quizá te
              <br />
              estés <em>preguntando.</em>
            </h2>
            <p>
              Una comunidad empieza
              <br />
              con las cosas claras.
            </p>
          </div>
          <div className="welcome-faq-list">
            {questions.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <Plus size={20} />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="welcome-final welcome-container" data-reveal>
          <div className="welcome-final-pattern" aria-hidden="true" />
          <span className="welcome-eyebrow">
            TU GENTE. TUS IDEAS. TU PRÓXIMO PASO.
          </span>
          <h2>
            Tu próxima buena idea
            <br />
            puede empezar con <em>un hola.</em>
          </h2>
          <p>Hay alguien con quien aprender lo que viene.</p>
          <Link className="welcome-button welcome-button-light" to={start}>
            {user ? "Volver a mi comunidad" : "Ser parte de LuminaUL"}
            <ArrowUpRight size={20} />
          </Link>
        </section>
      </main>
      <footer className="welcome-footer welcome-container">
        <div>
          <Link to="/nosotros" aria-label="LuminaUL, presentación">
            <Brand compact />
          </Link>
          <p></p>
        </div>
        <div>
          <a href="#proposito">Nuestro propósito</a>
          <a href="#preguntas">Preguntas frecuentes</a>
          <Link to={user ? "/" : "/login"}>
            {user ? "Mi comunidad" : "Iniciar sesión"}
          </Link>
        </div>
        <span>
          © 2026 LuminaUL
          <br />
          Aprendemos en comunidad.
        </span>
      </footer>
    </div>
  );
}
