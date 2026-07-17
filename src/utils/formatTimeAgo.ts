// Convierte una fecha ISO (created_at del backend) en texto relativo en español,
// por ejemplo "Hace 2 horas". Sustituye al campo mock "timeAgo" del diseño.
export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (Number.isNaN(seconds)) return "";
  if (seconds < 60) return "Hace un momento";

  const units = [
    { limit: 3600, div: 60, singular: "minuto", plural: "minutos" },
    { limit: 86400, div: 3600, singular: "hora", plural: "horas" },
    { limit: 604800, div: 86400, singular: "día", plural: "días" },
    { limit: 2592000, div: 604800, singular: "semana", plural: "semanas" },
    { limit: 31536000, div: 2592000, singular: "mes", plural: "meses" },
    { limit: Infinity, div: 31536000, singular: "año", plural: "años" },
  ];

  for (const unit of units) {
    if (seconds < unit.limit) {
      const value = Math.floor(seconds / unit.div);
      return `Hace ${value} ${value === 1 ? unit.singular : unit.plural}`;
    }
  }

  return "";
}
