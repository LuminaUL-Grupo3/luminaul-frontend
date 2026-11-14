import { useEffect, useRef, useState } from "react";

/** Agota los diez segundos y reserva 240 ms para la salida antes de retirar el aviso. */
export function useNoticeLifetime(dismiss: () => void) {
  const [closing, setClosing] = useState(false);
  const callback = useRef(dismiss);
  callback.current = dismiss;
  useEffect(() => {
    const timer = window.setTimeout(() => setClosing(true), 10_000);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => callback.current(), 240);
    return () => window.clearTimeout(timer);
  }, [closing]);
  return { closing, close: () => setClosing(true) };
}
