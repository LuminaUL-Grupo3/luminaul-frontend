// Curso del catálogo maestro: GET /courses.
// Se usa para poblar dinámicamente los <select> de curso y ciclo del FilterPanel.
export interface Course {
  id: string;
  name: string;
  cycle: number;
}
