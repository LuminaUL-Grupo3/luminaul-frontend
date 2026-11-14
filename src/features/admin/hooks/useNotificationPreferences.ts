import { useEffect, useState } from "react";

export interface NotificationPreferences {
  enabled: boolean;
  minimum: "normal" | "high" | "all";
}
const defaults: NotificationPreferences = { enabled: true, minimum: "normal" };
const changeEvent = "luminaul:notification-preferences";
const memory = new Map<string, NotificationPreferences>();

/** Preferencia de presentación por cuenta y navegador; no contiene credenciales ni altera entregas. */
export function useNotificationPreferences(userId: string) {
  const key = `luminaul.notifications.${userId}`;
  function read(): NotificationPreferences {
    try {
      const value =
        (JSON.parse(
          localStorage.getItem(key) || "null",
        ) as Partial<NotificationPreferences> | null) || memory.get(key);
      return {
        enabled: value?.enabled !== false,
        minimum:
          value?.minimum === "high" || value?.minimum === "all"
            ? value.minimum
            : "normal",
      };
    } catch {
      return memory.get(key) || defaults;
    }
  }
  const [preferences, setPreferences] = useState(read);
  useEffect(() => {
    const update = () => setPreferences(read());
    update();
    window.addEventListener(changeEvent, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(changeEvent, update);
      window.removeEventListener("storage", update);
    };
  }, [key]);
  function save(next: NotificationPreferences) {
    setPreferences(next);
    memory.set(key, next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* La preferencia sigue activa durante esta sesión. */
    }
    window.dispatchEvent(new Event(changeEvent));
  }
  return { preferences, save };
}
