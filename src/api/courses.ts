import { apiFetch } from "./client";
import type { Course } from "../types/course";

// GET /courses — catálogo maestro de cursos (id, name, cycle).
// Alimenta los desplegables de curso y ciclo del panel de filtros.
export function getCourses(): Promise<Course[]> {
  return apiFetch<Course[]>("/courses");
}
