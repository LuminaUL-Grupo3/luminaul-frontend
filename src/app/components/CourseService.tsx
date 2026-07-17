
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export interface Course {
  id: string;
  name: string;
  cycle: number;
}


// CourseController.tsx -> CourseService.tsx -> GET /api/v1/courses
// (Los cursos no figuran en el diagrama de secuencia; se sigue la misma
// arquitectura controlador -> servicio y espeja el backend CourseService.py.)
export async function getCourses(): Promise<Course[]> {
  const response = await fetch(`${API_BASE_URL}/courses`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      typeof errorBody?.detail === 'string'
        ? errorBody.detail
        : 'No se pudieron cargar los cursos.'
    );
  }

  return response.json();
}
