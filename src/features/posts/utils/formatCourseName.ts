// Normaliza los nombres de cursos en mayúsculas de manera uniforme
export function formatCourseName(rawName: string): string {
  if (!rawName) return "";
  return rawName.trim().toLocaleUpperCase("es-PE");
}

