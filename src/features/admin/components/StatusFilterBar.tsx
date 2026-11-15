import { Filter } from "lucide-react";

interface FilterOption<T extends string | undefined> {
  label: string;
  value: T;
}

interface StatusFilterBarProps<T extends string | undefined> {
  ariaLabel: string;
  value: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
}

/** Barra de filtro compacta para distinguir filtros de estado frente a botones de decisión. */
export function StatusFilterBar<T extends string | undefined>({
  ariaLabel,
  value,
  options,
  onChange,
}: StatusFilterBarProps<T>) {
  return (
    <div className="admin-filter-bar">
      <span className="admin-filter-label">
        <Filter size={14} aria-hidden="true" />
        Filtro:
      </span>
      <div className="admin-filter-group" role="group" aria-label={ariaLabel}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={active}
              className={`admin-filter-chip ${active ? "active" : ""}`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

