import { apiFetch } from "./client";
import type { Publication, PublicationType } from "../types/publication";

// Filtros del feed (HU 1.3), mapeados al contrato oficial GET /api/v1/posts:
// course_id, type y cycle son filtros de servidor; limit/offset paginan.
export interface PublicationFilters {
  course_id?: string;
  type?: PublicationType;
  cycle?: number;
  limit?: number;
  offset?: number;
}

// Arma el query string omitiendo los filtros vacíos y aplicando paginación por defecto.
function buildQuery(filters: PublicationFilters): string {
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

// GET /posts — feed principal con filtros opcionales por curso, tipo y ciclo.
// La entidad de dominio es "publication" (tabla publications); el equipo expone
// la ruta REST como /posts.
export function getPublications(
  filters: PublicationFilters = {},
): Promise<Publication[]> {
  return apiFetch<Publication[]>(`/posts${buildQuery(filters)}`);
}
