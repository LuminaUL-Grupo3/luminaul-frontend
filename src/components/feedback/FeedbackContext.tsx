import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, HelpCircle, X } from "lucide-react";

export type Confirmation = {
  title: string;
  description: string;
  acceptLabel?: string;
  cancelLabel?: string;
};

export type Feedback = {
  confirm: (options: Confirmation) => Promise<boolean>;
  notify: (message: string) => void;
};

export const FeedbackContext = createContext<Feedback | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [message, setMessage] = useState<{ id: number; text: string } | null>(
    null,
  );
  const resolvePending = useRef<((accepted: boolean) => void) | null>(null);
  const sequence = useRef(0);
  const opener = useRef<HTMLElement | null>(null);

  const confirm = useCallback((options: Confirmation) => {
    resolvePending.current?.(false);
    opener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setConfirmation(options);
    return new Promise<boolean>((resolve) => {
      resolvePending.current = resolve;
    });
  }, []);

  const notify = useCallback(
    (text: string) => setMessage({ id: ++sequence.current, text }),
    [],
  );

  const settle = useCallback((accepted: boolean) => {
    const resolve = resolvePending.current;
    resolvePending.current = null;
    setConfirmation(null);
    const target = opener.current;
    requestAnimationFrame(() => {
      if (target?.isConnected) target.focus();
    });
    resolve?.(accepted);
  }, []);

  useEffect(
    () => () => {
      resolvePending.current?.(false);
    },
    [],
  );

  return (
    <FeedbackContext.Provider value={{ confirm, notify }}>
      {children}
      {confirmation && (
        <ConfirmationDialog options={confirmation} settle={settle} />
      )}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {message && (
          <div className="toast" key={message.id}>
            <CheckCircle2 size={22} aria-hidden="true" />
            <p>{message.text}</p>
            <button
              type="button"
              className="icon-button"
              aria-label="Cerrar notificación"
              onClick={() => setMessage(null)}
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    </FeedbackContext.Provider>
  );
}

function ConfirmationDialog({
  options,
  settle,
}: {
  options: Confirmation;
  settle: (accepted: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    titleId = useId(),
    descriptionId = useId();

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    el.showModal();
    return () => {
      if (el.open) el.close();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="dialog confirmation-dialog"
      onCancel={(e) => {
        e.preventDefault();
        settle(false);
      }}
    >
      <div className="modal-header">
        <h2 id={titleId}>
          <HelpCircle size={20} aria-hidden="true" />
          {options.title}
        </h2>
        <button
          type="button"
          className="icon-button"
          aria-label="Cerrar ventana"
          onClick={() => settle(false)}
        >
          <X size={18} />
        </button>
      </div>
      <p id={descriptionId}>{options.description}</p>
      <div className="modal-actions">
        <button
          type="button"
          className="button secondary"
          autoFocus
          onClick={() => settle(false)}
        >
          {options.cancelLabel || "Cancelar"}
        </button>
        <button
          type="button"
          className="button danger"
          onClick={() => settle(true)}
        >
          {options.acceptLabel || "Confirmar"}
        </button>
      </div>
    </dialog>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx)
    throw new Error("useFeedback must be used within a FeedbackProvider");
  return ctx;
}
