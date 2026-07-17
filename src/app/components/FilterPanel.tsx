import { Filter } from 'lucide-react';
import type { Course } from '../../types/course';
import type { PostType } from '../../types/post';

type TypeValue = '' | PostType;

interface FilterPanelProps {
  courses: Course[];
  selectedType: TypeValue;
  selectedCourseId: string;
  selectedCycle: string;
  onTypeChange: (type: TypeValue) => void;
  onCourseChange: (courseId: string) => void;
  onCycleChange: (cycle: string) => void;
  onClearFilters: () => void;
}

// Etiquetas visibles mapeadas 1:1 a los valores que espera el API (type).
const TYPE_OPTIONS: { value: TypeValue; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'study_group', label: 'Grupo de Estudio' },
  { value: 'tutoring', label: 'Asesoría' },
];

export function FilterPanel({
  courses,
  selectedType,
  selectedCourseId,
  selectedCycle,
  onTypeChange,
  onCourseChange,
  onCycleChange,
  onClearFilters,
}: FilterPanelProps) {
  const hasActiveFilters =
    selectedType !== '' || selectedCourseId !== '' || selectedCycle !== '';

  // Ciclos y cursos se derivan del catálogo real (GET /courses).
  const cycles = Array.from(new Set(courses.map((c) => c.cycle))).sort((a, b) => a - b);
  const visibleCourses = selectedCycle
    ? courses.filter((c) => String(c.cycle) === selectedCycle)
    : courses;

  const selectedCourseName = courses.find((c) => c.id === selectedCourseId)?.name ?? '';
  const selectedTypeLabel = TYPE_OPTIONS.find((o) => o.value === selectedType)?.label ?? '';

  return (
    <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-xl">Filtros</h2>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block mb-3 font-medium">Tipo de publicación</label>
          <div className="space-y-2">
            {TYPE_OPTIONS.map((option) => (
              <label
                key={option.value || 'todos'}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="postType"
                  value={option.value}
                  checked={selectedType === option.value}
                  onChange={() => onTypeChange(option.value)}
                  className="w-4 h-4 text-primary accent-primary"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <label className="block mb-3 font-medium">Ciclo académico</label>
          <select
            value={selectedCycle}
            onChange={(e) => onCycleChange(e.target.value)}
            className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
          >
            <option value="">Todos los ciclos</option>
            {cycles.map((cycle) => (
              <option key={cycle} value={String(cycle)}>
                {cycle}° ciclo
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-border pt-6">
          <label className="block mb-3 font-medium">Curso</label>
          <select
            value={selectedCourseId}
            onChange={(e) => onCourseChange(e.target.value)}
            className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
          >
            <option value="">Todos los cursos</option>
            {visibleCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">Filtros activos:</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {selectedType && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {selectedTypeLabel}
                <button onClick={() => onTypeChange('')}>×</button>
              </span>
            )}

            {selectedCycle && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {selectedCycle}° ciclo
                <button onClick={() => onCycleChange('')}>×</button>
              </span>
            )}

            {selectedCourseId && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {selectedCourseName}
                <button onClick={() => onCourseChange('')}>×</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
