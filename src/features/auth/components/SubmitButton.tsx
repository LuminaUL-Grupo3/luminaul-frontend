import { ReactNode } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

export function SubmitButton({
  pending,
  children,
  pendingLabel = "Procesando…",
  className = "button full",
  disabled = false,
}: {
  pending: boolean;
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      className={className}
      disabled={pending || disabled}
      aria-busy={pending}
    >
      {pending ? <LoaderCircle className="spin" size={18} /> : null}
      {pending ? pendingLabel : children}
      {!pending && <ArrowUpRight size={18} />}
    </button>
  );
}
