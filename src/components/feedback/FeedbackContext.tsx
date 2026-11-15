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
import { useNoticeLifetime } from "@/hooks/useNoticeLifetime";

export type Confirmation = {
  title: string;
  description: string;
  acceptLabel?: string;
  cancelLabel?: string;
  informative?: boolean;
};

export type Feedback = {
  confirm: (options: Confirmation) => Promise<boolean>;
  alert: (options: Omit<Confirmation, "cancelLabel" | "informative">) => Promise<void>;
  notify: (message: string) => void;
  toggleSpotify: () => void;
};

export const FeedbackContext = createContext<Feedback | null>(null);

const DEFAULT_SPOTIFY_EMBED =
  "https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO08ff3r?autoplay=1";

function toSpotifyEmbedUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_SPOTIFY_EMBED;
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const candidate = srcMatch ? srcMatch[1] : trimmed;
  try {
    const parsed = new URL(candidate);
    if (
      parsed.hostname !== "open.spotify.com" &&
      parsed.hostname !== "embed.spotify.com"
    ) {
      return null;
    }
    const cleanPath = parsed.pathname.replace(/^\/intl-[a-z-]+\//i, "/");
    const embedPath = cleanPath.startsWith("/embed/")
      ? cleanPath
      : `/embed${cleanPath}`;
    return `https://open.spotify.com${embedPath}?autoplay=1`;
  } catch {
    return null;
  }
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [message, setMessage] = useState<{ id: number; text: string } | null>(
    null,
  );
  const [spotifyOpen, setSpotifyOpen] = useState(false);
  const [spotifyInput, setSpotifyInput] = useState(DEFAULT_SPOTIFY_EMBED);
  const [spotifyUrl, setSpotifyUrl] = useState(DEFAULT_SPOTIFY_EMBED);
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

  const alert = useCallback(
    async (options: Omit<Confirmation, "cancelLabel" | "informative">) => {
      await confirm({
        ...options,
        acceptLabel: options.acceptLabel || "Entendido",
        informative: true,
      });
    },
    [confirm],
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

  const toggleSpotify = useCallback(
    () => setSpotifyOpen((prev) => !prev),
    [],
  );

  return (
    <FeedbackContext.Provider value={{ confirm, alert, notify, toggleSpotify }}>
      {children}
      {confirmation && (
        <ConfirmationDialog options={confirmation} settle={settle} />
      )}
      <div id="app-notice-region" className="app-notices" aria-label="Avisos">
        {message && (
          <ActionToast
            key={message.id}
            text={message.text}
            dismiss={() =>
              setMessage((current) =>
                current?.id === message.id ? null : current,
              )
            }
          />
        )}
      </div>
      {spotifyOpen && (
        <div
          className="spotify-toast"
          role="region"
          aria-label="Reproductor de Spotify"
        >
          <button
            type="button"
            className="spotify-toast-close"
            onClick={() => setSpotifyOpen(false)}
            aria-label="Cerrar reproductor"
          >
            <X size={13} />
          </button>
          <form
            className="spotify-toast-form"
            onSubmit={(e) => {
              e.preventDefault();
              const next = toSpotifyEmbedUrl(spotifyInput);
              if (!next) {
                notify("Ingresa un enlace o embed válido de Spotify.");
                return;
              }
              setSpotifyUrl(next);
              setSpotifyInput(next);
            }}
          >
            <input
              type="text"
              value={spotifyInput}
              onChange={(e) => setSpotifyInput(e.target.value)}
              placeholder="Pega enlace o embed de Spotify..."
              aria-label="Enlace o embed de Spotify"
            />
            <button type="submit">Cargar</button>
          </form>
          <div className="spotify-toast-frame">
            <iframe
              key={spotifyUrl}
              src={spotifyUrl}
              width="100%"
              height="152"
              allow="encrypted-media; autoplay"
              title="Playlist de estudio en Spotify"
            />
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

function ActionToast({ text, dismiss }: { text: string; dismiss: () => void }) {
  const { closing, close } = useNoticeLifetime(dismiss);
  return (
    <div
      className={`toast action-toast ${closing ? "notice-closing" : ""}`}
      role="status"
    >
      <span className="notice-lifetime" aria-hidden="true">
        <span />
      </span>
      <CheckCircle2 size={22} aria-hidden="true" />
      <p>{text}</p>
      <button
        type="button"
        className="icon-button"
        aria-label="Cerrar notificación"
        onClick={close}
      >
        <X size={18} />
      </button>
    </div>
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
        {!options.informative && (
          <button
            type="button"
            className="button secondary"
            autoFocus
            onClick={() => settle(false)}
          >
            {options.cancelLabel || "Cancelar"}
          </button>
        )}
        <button
          type="button"
          className="button confirmation-accept"
          autoFocus={Boolean(options.informative)}
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
