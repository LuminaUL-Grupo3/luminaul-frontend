import { apiFetch } from "./client";
import type { Publication, PublicationType } from "../types/publication";

// Filtros que el FilterPanel envía por la URL al feed (HU 1.3).
// course_id y type son los únicos parámetros de filtro del contrato oficial;
// limit y offset son la paginación obligatoria del feed.
export interface PublicationFilters {
  course_id?: string;
  type?: PublicationType;
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
  params.set("limit", String(filters.limit ?? 15));
  params.set("offset", String(filters.offset ?? 0));

  return `?${params.toString()}`;
}

// GET /publications — feed principal con filtros opcionales por curso y tipo.
export function getPublications(
  filters: PublicationFilters = {},
): Promise<Publication[]> {
  return apiFetch<Publication[]>(`/publications${buildQuery(filters)}`);
}
