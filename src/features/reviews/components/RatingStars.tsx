import { Star } from "lucide-react";
import { REVIEW_LIMITS } from "../types";
import "./reviews.css";

const STARS = Array.from({ length: REVIEW_LIMITS.MAX_RATING }, (_, i) => i + 1);

// Selector interactivo de 1 a 5 estrellas; sin onChange es un visor de solo lectura
// que admite promedios decimales (4.3 = 4 estrellas llenas y el 30 % de la quinta).
export function RatingStars({
  value,
  onChange,
  size = 18,
  label = "Calificación",
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  label?: string;
}) {
  if (!onChange) {
    return (
      <span
        className="rating-stars"
        role="img"
        aria-label={`${value.toFixed(1)} de ${REVIEW_LIMITS.MAX_RATING} estrellas`}
      >
        {STARS.map((n) => (
          <span key={n} className="rating-star">
            <Star size={size} className="rating-star-empty" aria-hidden="true" />
            <span
              className="rating-star-fill"
              style={{ width: `${Math.min(1, Math.max(0, value - n + 1)) * 100}%` }}
            >
              <Star size={size} aria-hidden="true" />
            </span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className="rating-stars interactive" role="radiogroup" aria-label={label}>
      {STARS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
          className={`rating-star-button ${n <= value ? "active" : ""}`}
          onClick={() => onChange(n)}
        >
          <Star size={size} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
