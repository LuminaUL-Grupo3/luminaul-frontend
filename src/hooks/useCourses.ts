import { useEffect, useState } from "react";
import { getCourses } from "../api/courses";
import type { Course } from "../types/course";

// Carga el catálogo maestro de cursos (GET /courses) una sola vez.
// Alimenta los desplegables de curso y ciclo del FilterPanel.
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    getCourses()
      .then((data) => {
        if (active) setCourses(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar los cursos");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { courses, loading, error };
}
