import { env } from "./env";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export class ApiClient {
  private baseUrl = env.API_URL;

  async request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const multipart = body instanceof FormData;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${this.baseUrl}${normalizedPath}`;
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers:
        body && !multipart ? { "Content-Type": "application/json" } : undefined,
      body: body ? (multipart ? body : JSON.stringify(body)) : undefined,
    });
    const data = await response
      .json()
      .catch(() => ({ message: "Respuesta no válida del servidor" }));
    if (!response.ok) {
      if (response.status === 401 && !path.startsWith("/auth/"))
        window.dispatchEvent(new Event("session-expired"));
      throw new ApiError(
        Array.isArray(data.message)
          ? data.message.join(". ")
          : data.message || "No se pudo completar la operación",
        response.status,
      );
    }
    return data as T;
  }
}

export const api = new ApiClient();

export const date = (value: string) =>
  new Date(value).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
