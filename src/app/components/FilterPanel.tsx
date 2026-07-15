import { Filter } from 'lucide-react';

interface FilterPanelProps {
  selectedType: string;
  selectedCourse: string;
  selectedCycle: string;
  onTypeChange: (type: string) => void;
  onCourseChange: (course: string) => void;
  onCycleChange: (cycle: string) => void;
  onClearFilters: () => void;
}

export function FilterPanel({
  selectedType,
  selectedCourse,
  selectedCycle,
  onTypeChange,
  onCourseChange,
  onCycleChange,
  onClearFilters,
}: FilterPanelProps) {
  const hasActiveFilters =
    selectedType !== '' || selectedCourse !== '' || selectedCycle !== '';

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
            {['', 'Grupo de Estudio', 'Asesoría'].map((type) => (
              <label
                key={type || 'todos'}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="postType"
                  value={type}
                  checked={selectedType === type}
                  onChange={(e) => onTypeChange(e.target.value)}
                  className="w-4 h-4 text-primary accent-primary"
                />
                <span>{type || 'Todos'}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <label className="block mb-3 font-medium">Curso</label>
          <select
            value={selectedCourse}
            onChange={(e) => onCourseChange(e.target.value)}
            className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
          >
            <option value="">Todos los cursos</option>
            <option value="Matemáticas I">Matemáticas I</option>
            <option value="Física General">Física General</option>
            <option value="Programación Básica">Programación Básica</option>
            <option value="Cálculo Diferencial">Cálculo Diferencial</option>
            <option value="Estadística">Estadística</option>
          </select>
        </div>

        <div className="border-t border-border pt-6">
          <label className="block mb-3 font-medium">Ciclo académico</label>
          <select
            value={selectedCycle}
            onChange={(e) => onCycleChange(e.target.value)}
            className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
          >
            <option value="">Todos los ciclos</option>
            <option value="1">1er ciclo</option>
            <option value="2">2do ciclo</option>
            <option value="3">3er ciclo</option>
            <option value="4">4to ciclo</option>
            <option value="5">5to ciclo</option>
            <option value="6">6to ciclo</option>
            <option value="7">7mo ciclo</option>
            <option value="8">8vo ciclo</option>
            <option value="9">9no ciclo</option>
            <option value="10">10mo ciclo</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">Filtros activos:</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {selectedType && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {selectedType}
                <button onClick={() => onTypeChange('')}>×</button>
              </span>
            )}

            {selectedCourse && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {selectedCourse}
                <button onClick={() => onCourseChange('')}>×</button>
              </span>
            )}

            {selectedCycle && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {selectedCycle}° ciclo
                <button onClick={() => onCycleChange('')}>×</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}