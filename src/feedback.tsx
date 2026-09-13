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

type Confirmation = {
  title: string;
  description: string;
  acceptLabel?: string;
  cancelLabel?: string;
};
type Feedback = {
  confirm: (options: Confirmation) => Promise<boolean>;
  notify: (message: string) => void;
};
const FeedbackContext = createContext<Feedback | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [message, setMessage] = useState<{ id: number; text: string } | null>(
    null,
  );
  const resolvePending = useRef<((accepted: boolean) => void) | null>(null);
  const sequence = useRef(0);
  const opener = useRef<HTMLElement | null>(null);
  const confirm = useCallback((options: Confirmation) => {
    // A superseded request is cancelled; it must never execute implicitly.
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
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="confirmation-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        settle(false);
      }}
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.target === event.currentTarget &&
          (event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom)
        )
          settle(false);
      }}
    >
      <div className="confirmation-symbol">
        <HelpCircle size={28} aria-hidden="true" />
      </div>
      <h2 id={titleId}>{options.title}</h2>
      <p id={descriptionId} className="confirmation-copy">
        {options.description}
      </p>
      <div className="modal-actions">
        <button
          type="button"
          className="button secondary"
          autoFocus
          onClick={() => settle(false)}
        >
          {options.cancelLabel || "Cancelar"}
        </button>
        <button type="button" className="button" onClick={() => settle(true)}>
          {options.acceptLabel || "Confirmar"}
        </button>
      </div>
    </dialog>
  );
}

export function useFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error("FeedbackProvider debe envolver la aplicación");
  return value;
}
