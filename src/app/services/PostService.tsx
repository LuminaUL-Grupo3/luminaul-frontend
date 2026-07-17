import { apiFetch } from "../../api/client";

// Capa de servicio de Publicaciones (frontend). Según la arquitectura del informe,
// el servicio "se conecta con el backend y hace la petición HTTP". Envuelve el
// helper apiFetch (fetch nativo) exponiendo los verbos HTTP que usa el módulo.
export const PostService = {
  get<T>(path: string): Promise<T> {
    return apiFetch<T>(path);
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) });
  },

  delete<T>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: "DELETE" });
  },
};
