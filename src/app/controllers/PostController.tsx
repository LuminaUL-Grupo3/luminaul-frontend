import { PostService } from "../services/PostService";
import type { Post, PostType } from "../../types/post";

// Filtros del feed (HU 1.3), mapeados al contrato oficial GET /api/v1/posts:
// course_id, type y cycle son filtros de servidor; limit/offset paginan.
export interface PostFilters {
  course_id?: string;
  type?: PostType;
  cycle?: number;
  limit?: number;
  offset?: number;
}

// Arma el query string omitiendo los filtros vacíos y aplicando paginación por defecto.
function buildQuery(filters: PostFilters): string {
  const params = new URLSearchParams();

  if (filters.type) {
    params.set("type", filters.type);
  }
  if (filters.course_id) {
    params.set("course_id", filters.course_id);
  }
  if (filters.cycle != null) {
    params.set("cycle", String(filters.cycle));
  }
  params.set("limit", String(filters.limit ?? 15));
  params.set("offset", String(filters.offset ?? 0));

  return `?${params.toString()}`;
}

// Controlador de Publicaciones (frontend): recibe la acción de la vista y
// orquesta la llamada a la capa de servicio.
export const PostController = {
  // filterFeed (HU 1.3 / 1.5) -> GET /api/v1/posts con filtros opcionales por
  // curso, tipo y ciclo. Devuelve el arreglo de posts para renderizar el feed.
  filterFeed(filters: PostFilters = {}): Promise<Post[]> {
    return PostService.get<Post[]>(`/posts${buildQuery(filters)}`);
  },
};
