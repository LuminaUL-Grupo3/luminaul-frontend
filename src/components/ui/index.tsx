import {
  useState,
  useEffect,
  useRef,
  useId,
  ReactNode,
  FormEvent,
  lazy,
  Suspense,
} from "react";
import { X, LoaderCircle, ArrowRight, MessageCircle, Flag } from "lucide-react";
import { api } from "../../config/api";
import { useFeedback } from "../../hooks/useFeedback";

// Carga el diálogo de SPEC-06 al abrirlo y evita un ciclo de importación con sus campos compartidos.
const ModerationReportModal = lazy(() =>
  import("@/features/moderation/components/ReportModal").then((module) => ({ default: module.ReportModal })),
);

export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return children ? (
    <div
      role={error ? "alert" : "status"}
      className={`notice ${error ? "error" : ""}`}
    >
      {children}
    </div>
  ) : null;
}

export function Loading() {
  return (
    <div className="loading">
      <LoaderCircle className="spin" size={22} /> Cargando…
    </div>
  );
}

export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <MessageCircle size={32} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function Avatar({
  name = "U",
  src,
  large = false,
}: {
  name?: string;
  src?: string;
  large?: boolean;
}) {
  const safeName = (name || "U").trim() || "U";
  return src ? (
    <img className={`avatar ${large ? "large" : ""}`} src={src} alt={safeName} />
  ) : (
    <span className={`avatar ${large ? "large" : ""}`}>
      {safeName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0]?.toUpperCase() || "")
        .join("") || "U"}
    </span>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        if (
          e.target === e.currentTarget &&
          (e.clientX < bounds.left ||
            e.clientX > bounds.right ||
            e.clientY < bounds.top ||
            e.clientY > bounds.bottom)
        )
          close();
      }}
    >
      <div className="modal-header">
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label="Cerrar"
          onClick={close}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}

type ConstrainedField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// Nombre visible del campo: el texto del <Field> que lo envuelve, o su aria-label
function fieldName(field: ConstrainedField): string {
  const label = field.closest("label.field")?.querySelector(":scope > span")?.textContent;
  return (label || field.getAttribute("aria-label") || "Este campo").trim();
}

// Traduce las restricciones HTML (required, minLength, min, max, type…) a un mensaje en
// español. Reemplaza los globos nativos del navegador, que salen en el idioma del sistema.
function constraintMessage(field: ConstrainedField): string {
  const name = `"${fieldName(field)}"`;
  const { validity } = field;
  const length = field.value.length;
  // minLength/maxLength se revisan a mano: el navegador no siempre marca tooShort en inputs
  // controlados por React
  const minLength = "minLength" in field ? field.minLength : -1;
  const maxLength = "maxLength" in field ? field.maxLength : -1;
  if (validity.valueMissing) return `Debes completar ${name}`;
  if (length > 0 && minLength > 0 && length < minLength)
    return `${name} debe tener al menos ${minLength} caracteres`;
  if (maxLength > 0 && length > maxLength)
    return `${name} no puede superar los ${maxLength} caracteres`;
  if (validity.badInput || validity.typeMismatch || validity.patternMismatch)
    return `${name} no tiene un formato válido`;
  if (validity.rangeUnderflow && "min" in field) return `${name} debe ser como mínimo ${field.min}`;
  if (validity.rangeOverflow && "max" in field) return `${name} debe ser como máximo ${field.max}`;
  if (validity.stepMismatch) return `${name} no tiene un valor válido`;
  return "";
}

function firstConstraintError(form: HTMLFormElement): { field: ConstrainedField; message: string } | null {
  for (const element of Array.from(form.elements)) {
    if (
      !(element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement) ||
      element.disabled
    )
      continue;
    const message = constraintMessage(element);
    if (message) return { field: element, message };
  }
  return null;
}

export function ActionForm({
  path,
  method = "POST",
  payload,
  title,
  children,
  done,
  label = "Guardar",
  confirm = false,
  cancel,
  validate,
}: {
  path: string;
  method?: string;
  payload: () => unknown;
  title?: string;
  children?: ReactNode;
  done?: () => void;
  label?: string;
  confirm?: boolean;
  cancel?: () => void;
  validate?: () => string;
}) {
  const feedback = useFeedback();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    // Mismo formato que el inicio de sesión: un solo mensaje, debajo de los campos.
    // La validación propia del formulario (validate) tiene prioridad sobre la genérica.
    const validationError = validate?.();
    if (validationError) {
      setMessage("");
      setError(validationError);
      return;
    }
    const constraint = firstConstraintError(e.currentTarget);
    if (constraint) {
      setMessage("");
      setError(constraint.message);
      constraint.field.focus();
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (
        confirm &&
        !(await feedback.confirm({
          title: "Confirmar acción",
          description: title || label,
          acceptLabel: label,
        }))
      )
        return;
      const r = await api.request<{ message?: string }>(
        path,
        method,
        payload(),
      );
      const message = r.message || "Cambios guardados";
      if (done) feedback.notify(message);
      else setMessage(message);
      done?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form" onSubmit={submit} noValidate>
      {title && <h3>{title}</h3>}
      {children}
      <Notice error>{error}</Notice>
      <Notice>{message}</Notice>
      <button className="button" disabled={busy}>
        {busy ? <LoaderCircle className="spin" size={18} /> : null}
        {busy ? "Guardando…" : label}
        <ArrowRight size={16} />
      </button>
      {cancel && (
        <button
          type="button"
          className="button secondary"
          onClick={cancel}
          disabled={busy}
        >
          Cancelar
        </button>
      )}
    </form>
  );
}

export function ReportButton({
  kind,
  id,
  disabled = false,
}: {
  kind: "publication" | "message" | "review";
  id: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="icon-button muted"
        title="Reportar contenido"
        aria-label="Reportar contenido"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <Flag size={16} />
      </button>
      {open && (
        <Suspense fallback={<span role="status">Cargando formulario…</span>}>
          <ModerationReportModal targetType={kind} targetId={id} close={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
