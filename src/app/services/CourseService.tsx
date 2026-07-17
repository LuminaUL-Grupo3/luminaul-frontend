import { apiFetch } from "../../api/client";
import type { Course } from "../../types/course";

// Capa de servicio de Cursos (frontend): hace la petición HTTP al backend.
// (Los cursos no figuran en el diagrama de secuencia, pero siguen la misma
// arquitectura controlador -> servicio descrita en el informe y en el backend
// CourseController.py / CourseService.py.)
export const CourseService = {
  get(): Promise<Course[]> {
    return apiFetch<Course[]>("/courses");
  },
};
