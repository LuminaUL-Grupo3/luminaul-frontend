import { useEffect, useState } from "react";
import { getPublications } from "../api/publications";
import type { Publication } from "../types/publication";
import type { PublicationFilters } from "../api/publications";

// Trae el feed de publicaciones (GET /publications) y lo vuelve a pedir cada vez
// que cambian los filtros de servidor (type / course_id). Expone reload() para
// reintentar tras un error.
export function usePublications(filters: PublicationFilters) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { type, course_id, limit, offset } = filters;

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    getPublications({ type, course_id, limit, offset })
      .then((data) => {
        if (active) setPublications(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Error al cargar las publicaciones",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type, course_id, limit, offset, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  return { publications, loading, error, reload };
}
