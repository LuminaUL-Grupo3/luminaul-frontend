export const env = {
  // Base de toda la API REST. Por defecto "/api" en el mismo origen (proxy de Vite en dev, Caddy en producción).
  API_URL: (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "/api",
  IS_DEV: import.meta.env?.DEV ?? false,
};
