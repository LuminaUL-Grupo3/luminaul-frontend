import { CourseService } from "../services/CourseService";
import type { Course } from "../../types/course";

// Controlador de Cursos (frontend): la vista le pide el catálogo y él orquesta
// la capa de servicio. Alimenta los desplegables de curso y ciclo del FilterPanel.
export const CourseController = {
  getCourses(): Promise<Course[]> {
    return CourseService.get();
  },
};
