import "./brand.css";

/** Dos páginas abiertas y un punto de luz representan conocimiento que se comparte. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`lumina-brand${compact ? " lumina-brand-compact" : ""}`}>
      <svg
        className="lumina-mark"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <rect width="48" height="48" rx="15" fill="currentColor" />
        <path
          d="M11.5 16.5c4.6-1.2 8.5.1 11.2 3.1v16c-3-2.6-6.8-3.6-11.2-2.5V16.5Zm15 3.1c2.7-3 6.6-4.3 11.2-3.1v16.6c-4.4-1.1-8.2-.1-11.2 2.5v-16Z"
          fill="#fffaf4"
        />
        <circle cx="25" cy="10" r="3" fill="#fffaf4" />
        <path
          d="m10.5 8.5 2.5 2.5M38 8l-2.5 3"
          stroke="#fffaf4"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span className="lumina-wordmark">
        Lumina<span>UL</span>
        <i aria-hidden="true" />
      </span>
    </span>
  );
}
