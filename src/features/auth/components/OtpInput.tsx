import { ClipboardEvent, KeyboardEvent, useEffect, useRef } from "react";
import { OTP_LENGTH } from "../constants";
import "../styles/auth.css";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
}

// Seis celdas de un dígito: avanza al escribir, retrocede con Backspace y acepta pegar el código
export function OtpInput({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  label = "Código de verificación",
}: OtpInputProps) {
  const cells = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const focusCell = (index: number) =>
    cells.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();

  // Diferido: dentro de un <dialog>, showModal() mueve el foco después de montar a los hijos
  useEffect(() => {
    if (!autoFocus) return;
    const frame = requestAnimationFrame(() => cells.current[0]?.focus());
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  // El valor nunca tiene huecos: solo se escribe en una celda llena o en la primera vacía
  function setDigit(index: number, digit: string) {
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(""));
  }

  function handleInput(index: number, raw: string) {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    if (typed.length > 1) {
      // Autocompletado del sistema (one-time-code) o varias teclas a la vez
      fill(index, typed);
      return;
    }
    setDigit(index, typed);
    focusCell(index + 1);
  }

  function fill(from: number, text: string) {
    const merged = (digits.slice(0, from).join("") + text).replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(merged);
    focusCell(merged.length);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        onChange(value.slice(0, index - 1));
        focusCell(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusCell(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusCell(index + 1);
    }
  }

  function handlePaste(index: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    fill(index, e.clipboardData.getData("text"));
  }

  return (
    <div className="otp-input" role="group" aria-label={label}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            cells.current[index] = el;
          }}
          value={digit}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          // Solo se puede escribir desde la primera celda vacía
          onFocus={(e) => {
            if (index > value.length) focusCell(value.length);
            else e.target.select();
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          placeholder=" "
          disabled={disabled}
          aria-label={`Dígito ${index + 1} de ${OTP_LENGTH}`}
        />
      ))}
    </div>
  );
}
