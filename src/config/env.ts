export const env = {
  API_URL: (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "",
  IS_DEV: import.meta.env?.DEV ?? false,
};
