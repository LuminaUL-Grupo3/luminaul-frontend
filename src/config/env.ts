const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("La variable VITE_API_URL no está configurada");
}

export const env = {
  apiUrl,
};