import { env } from "../config/env";

type ApiErrorResponse = {
  detail?: string;
  message?: string;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = "Ocurrió un error al comunicarse con el servidor";

    try {
      const errorData = (await response.json()) as ApiErrorResponse;
      errorMessage =
        errorData.detail ??
        errorData.message ??
        errorMessage;
    } catch {
      // Mantiene el mensaje genérico si la respuesta no es JSON.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}