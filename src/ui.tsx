import {
  useState,
  useEffect,
  useRef,
  useId,
  ReactNode,
  FormEvent,
} from "react";
import { X, LoaderCircle, ArrowRight, MessageCircle, Flag } from "lucide-react";
import { api } from "./api";
import { useFeedback } from "./feedback";
export function useResource<T>(path: string, initial: T) {
  const [data, setData] = useState<T>(initial),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .request<T>(path)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, revision]);
  return {
    data,
    setData,
    loading,
    error,
    reload: () => setRevision((v) => v + 1),
  };
}
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
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const validationError = validate?.();
    if (validationError) {
      setError(validationError);
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
    <form className="form" onSubmit={submit} noValidate={Boolean(validate)}>
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
}: {
  kind: "publication" | "message" | "review";
  id: string;
}) {
  const [open, setOpen] = useState(false),
    [reason, setReason] = useState("");
  return (
    <>
      <button
        className="icon-button muted"
        title="Reportar contenido"
        aria-label="Reportar contenido"
        onClick={() => setOpen(true)}
      >
        <Flag size={16} />
      </button>
      {open && (
        <Modal title="Reportar contenido" close={() => setOpen(false)}>
          <ActionForm
            path="/reports"
            payload={() => ({ kind, content_id: id, reason })}
            label="Enviar reporte"
            done={() => {
              setOpen(false);
              setReason("");
            }}
          >
            <Field label="Motivo">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                minLength={3}
                maxLength={500}
                placeholder="Describe qué debemos revisar"
              />
            </Field>
          </ActionForm>
        </Modal>
      )}
    </>
  );
}
