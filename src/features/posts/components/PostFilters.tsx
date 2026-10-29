import { Search, SlidersHorizontal } from "lucide-react";
import { Course } from "../types";

interface PostFiltersProps {
  query: string;
  onQueryChange: (val: string) => void;
  type: string;
  onTypeChange: (val: string) => void;
  course: string;
  onCourseChange: (val: string) => void;
  cycle: string;
  onCycleChange: (val: string) => void;
  courses: Course[];
}

export function PostFilters({
  query,
  onQueryChange,
  type,
  onTypeChange,
  course,
  onCourseChange,
  cycle,
  onCycleChange,
  courses,
}: PostFiltersProps) {
  return (
    <div className="filters">
      <label className="search-input">
        <Search size={18} />
        <input
          aria-label="Buscar publicaciones"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar un curso o una publicación…"
        />
      </label>
      <div className="filter-row">
        <div
          className="type-filters"
          role="group"
          aria-label="Tipo de publicación"
        >
          {[
            ["study_group", "Grupo de Estudio"],
            ["tutoring", "Asesoría"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`button small ${type === value ? "" : "secondary"}`}
              aria-pressed={type === value}
              onClick={() => onTypeChange(type === value ? "" : value)}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          aria-label="Curso"
          value={course}
          onChange={(e) => onCourseChange(e.target.value)}
        >
          <option value="">Todos los cursos</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Ciclo"
          value={cycle}
          onChange={(e) => onCycleChange(e.target.value)}
        >
          <option value="">Todos los ciclos</option>
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={i + 1}>
              Ciclo {i + 1}
            </option>
          ))}
        </select>
        <SlidersHorizontal size={17} />
      </div>
    </div>
  );
}
