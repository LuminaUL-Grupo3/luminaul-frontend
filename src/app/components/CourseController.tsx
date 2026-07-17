import { getCourses as fetchCourses, type Course } from './CourseService';

// FilterPanel/SearchPage -> CourseController.tsx -> CourseService.tsx
// Devuelve el catálogo de cursos para poblar los desplegables de curso y ciclo.
export function getCourses(): Promise<Course[]> {
  return fetchCourses();
}
